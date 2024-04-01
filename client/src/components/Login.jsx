import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/home');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setLoginData({...loginData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:4000/login', loginData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);
            navigate("/home");
        } catch (err) {
            if (err.response.data.error) {
                setErrorMessage(err.response.data.error);
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div>
            <div className='form-container'>
            <h2>Login</h2>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <form onSubmit={handleSubmit}>
                <input
                type="email"
                name="email"
                placeholder="Email"
                value={loginData.email}
                onChange={handleChange}
                />
                <br/>
                <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleChange}
                />
                <br/>
                <button className='form-button' type="submit">Login</button>
                </form>
            <p>Don&apos;t have an account? <Link to="/register">Register here</Link></p>
            </div>
        </div>
    );
}

export default Login;
