import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import io from 'socket.io-client';

function LanguageRunner() {
    const [language, setLanguage] = useState('python');
    const [userCode, setCode] = useState('');
    const [isEditorReady, setEditorReady] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const id = localStorage.getItem('room-ID');
    const token = localStorage.getItem('token');
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io('http://localhost:4000');
        
        socketRef.current.on('languageChange', ({ channel, language }) => {
            if (channel === id) {
                setLanguage(language);
                fetchCode(language);
            }
        });
    
        socketRef.current.on('codeUpdate', ({ channel, code }) => {
            if (channel === id) {
                setCode(code);
                setEditorReady(true);
            }
        });
    
        return () => {
            socketRef.current.disconnect();
        };
    }, [id]);    

    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            fetchCode(language);
        }
    }, [navigate, token, language]);
    

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        socketRef.current.emit('languageChange', { channel: id, language: newLanguage });
        fetchCode(newLanguage);
    };

    const fetchCode = async (lang) => {
        try {
            const res = await axios.get(`http://localhost:4000/editor/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCode(res.data.room[`${lang}Code`]);
            setEditorReady(true);
        } catch (err) {
            console.log(err);
        }
    };

    const handleEditorChange = (value) => {
        setCode(value);
        socketRef.current.emit('codeChange', { channel: id, code: value, language });
        updateCodeInDatabase(value);
    };

    const updateCodeInDatabase = async (code) => {
        try {
            await axios.post(`http://localhost:4000/editor/${id}`, 
            { code, lang: language }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            console.log(err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        }
    };   

    const handleSubmit = async (e) => {
        e.preventDefault();
        setOutput("");
        setError("");
    
        const compileUrl = `http://localhost:4000/compile/${language.toLowerCase()}`;
    
        try {
            const res = await axios.post(compileUrl, { code: userCode }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOutput(res.data.result);
        } catch (err) {
            setError(err.response?.data?.error || "An error occurred");
        }
    };
    
    

    return (
        <>
        <div className='background-static'>
            </div>
            <div className='editor-container'>
                    <h2>{language.toUpperCase()} Editor</h2>
                    <div>
                        <select value={language} onChange={e => handleLanguageChange(e.target.value)} className="mb-4">
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="node">Node.js</option>
                            <option value="cpp">C++</option>
                            <option value="rust">Rust</option>
                        </select>
                    </div>
                    <form onSubmit={handleSubmit} className='e-form'>
                        {isEditorReady && (
                            <Editor
                                height="65vh"
                                width="120vh"
                                defaultLanguage={language.toLowerCase()}
                                theme='vs-dark'
                                value={userCode}
                                onChange={handleEditorChange}
                            />
                        )}
                    </form>
                <ul>
                <li><button type="submit">Run</button></li>
                <li><div className="output-container">
                    OUTPUT:
                    {output && (<pre>{output}</pre>)}
                    {error && (<pre>{error}</pre>)}
                </div></li>
                <li><button onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                }}>Sign Out</button>
                <br />
                </li>
            </ul>
        </div>
        </>
    );
}

export default LanguageRunner;
