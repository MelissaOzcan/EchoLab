import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';

function PythonRunner() {
    const [userCode, setCode] = useState('# Write your python code here...\n');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const id = localStorage.getItem('room-ID');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [navigate, token]);

    useEffect(() => {
        (async () => {
            try {
                // Fetch code from DB
                const res = await axios.get(`http://localhost:4000/editor/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCode(res.data.room.pythonCode);
            } catch (err) {
                console.log(err);
            }
        })();
    })

    const handleEditorChange = (value) => {
        // TODO: Need a request here to make sure all code changes are saved the the Database.
        (async () => {
            try {
                console.log("HELLLOOOOOO");
                await axios.post(`http://localhost:4000/editor/${id}`, { code: userCode, lang: 'python'}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (err) {
                console.log(err);
            }
        })();
        console.log("User Code: ", userCode);

        setCode(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
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
        </div>
    );
}

export default PythonRunner;
