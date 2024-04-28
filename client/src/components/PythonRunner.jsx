import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import io from 'socket.io-client';

function PythonRunner() {
    const [userCode, setCode] = useState('# Write your python code here...\n');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const id = localStorage.getItem('room-ID');
    const token = localStorage.getItem('token');
    const socketRef = io('http://localhost:4000');
    let code;

    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            fetchCode();
        }
    }, [navigate, token]);

    useEffect(() => {
        // Listen for code updates from other users
        socketRef.on('codeUpdate', ({ code }) => {
            console.log(`Received code update: ${code}`);
            setCode(code); // Update code in the editor
        });

        return () => {
            socketRef.disconnect();
        };
    }, [userCode]);

    const fetchCode = async () => {
        try {
            const res = await axios.get(`http://localhost:4000/editor/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCode(res.data.room.pythonCode);
        } catch (err) {
            console.log(err);
        }
    };

    const handleEditorChange = (value) => {
        // Store updated code into DB after every change
        setCode(value);
        console.log('Emitting codeChange event:', { channel: id, code: value });

        // Emit codeChange event to WebSocket server
        socketRef.emit('codeChange', { channel: id, code: value });

        console.log('codeChange event emitted successfully');

        // Update code in the database
        updateCodeInDatabase(value);
    };

    const updateCodeInDatabase = async (code) => {
        try {
            await axios.post(`http://localhost:4000/editor/${id}`, { code: code, lang: 'python' }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            if (err.status === 401 || err.error === 'Failed to authenticate token') {
                navigate('/login');
            }
            console.log(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setOutput('');
        setError('');
        try {
            const res = await axios.post(`http://localhost:4000/compile/python`, { code: userCode }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOutput(res.data.result);
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div>
            <h2>Python Interpreter</h2>
            <form onSubmit={handleSubmit}>
                <Editor
                    height="65vh"
                    width="120vh"
                    defaultLanguage="python"
                    theme='vs-dark'
                    value={userCode}
                    onChange={handleEditorChange}
                />
                <button type="submit">Run</button>
            </form>
            <div className="output-container">
                OUTPUT:
                {output && (
                    <pre>{output}</pre>
                )}
                {error && (
                    <pre>{error}</pre>
                )}
            </div>
            <button onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
            }}>Sign Out</button>
            <br />
        </div>
    );
}

export default PythonRunner;
