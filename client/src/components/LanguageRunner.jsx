import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import io from "socket.io-client";
import Sidebar from "./Sidebar";

// Utility function to get the correct language identifier for Monaco Editor
const getLanguageForEditor = (language) => {
    switch (language) {
        case 'node': return 'javascript';
        case 'cpp': return 'cpp';
        case 'java': return 'java';
        case 'rust': return 'rust';
        default: return language;  // handles 'python' and any future additions
    }
};

function LanguageRunner() {
    const [language, setLanguage] = useState('python');
    const [userCode, setCode] = useState('');
    const [isEditorReady, setEditorReady] = useState(false);
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const id = localStorage.getItem("room-ID");
    const token = localStorage.getItem("token");
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io('http://localhost:4000');

        socketRef.current.on('languageUpdate', ({ channel, language }) => {
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

        return () => socketRef.current.disconnect();
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
        socketRef.current.emit('languageUpdate', { channel: id, language: newLanguage });
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
            console.error('Fetch code error:', err);
        }
    };

    const handleEditorChange = (value) => {
        setCode(value);
        socketRef.current.emit('codeChange', { channel: id, code: value, language });
        updateCodeInDatabase(value);
    };

    const updateCodeInDatabase = async (code) => {
        try {
            await axios.post(`http://localhost:4000/editor/${id}`, { code, lang: language }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Update database error:', err);
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
            }
            );
            setOutput(res.data.result);
        } catch (err) {
            setError(err.response?.data?.error || "An error occurred");
        }
    };

    const handleSignOut = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `http://localhost:4000/logout`,
                {
                    roomId: id,
                    username: user
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            localStorage.removeItem("token");
            navigate("/login");
        } catch (e) {
            setError(err.response?.data?.error || "An error occurred");
        }
    }

    return (
        <>
        <div className="editor">
            <div className='background-static'></div>
            <div className="min-h-screen flex flex-col">
            <div className="flex-grow overflow-y-auto">
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
                <div className='flex'>
                    <div className='w-3/4 flex flex-col items-center'>
                            <form onSubmit={handleSubmit} className='e-form w-full'>
                                {isEditorReady && (
                                    <Editor
                                        key={language}  // Force re-render when language changes
                                        height="75vh"
                                        defaultLanguage={getLanguageForEditor(language)}
                                        theme='vs-dark'
                                        value={userCode}
                                        onChange={handleEditorChange}
                                    />
                                )}
                                <div className='flex flex-col items-center w-full'>
                                        <button type="submit" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Run</button>
                                        <div className="output-container mt-4 w-full max-h-50 overflow-y-auto"> 
                                            <div className="text-sm -600 mb-2">OUTPUT:</div>
                                            {output && (
                                                <pre className="bg-gray-200 text-black rounded p-3 whitespace-pre-wrap break-words">{output}</pre>
                                            )}
                                            {error && (
                                                <pre className="bg-red-200 text-red-800 rounded p-3 whitespace-pre-wrap break-words">{error}</pre>
                                            )}
                                        </div>
                                        {/*
                                        <button onClick={() => {
                                            localStorage.removeItem('token');
                                            navigate('/login');
                                        }} className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                            Sign Out
                                        </button>
                                        */}
                                    </div>
                                </form>
                            </div>
                            <div className='w-1/4'>
                                <Sidebar />
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LanguageRunner;
