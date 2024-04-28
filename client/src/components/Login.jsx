import { useState, useEffect, useRef} from 'react';
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
        document.body.style.overflow = 'hidden';
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const currentTimeInSecs = Math.floor(Date.now() / 1000);
            if (decodedToken.exp < currentTimeInSecs) {
                localStorage.removeItem('token');
            } else {
                navigate('/home');
            }
        }

        const interval = setInterval(createBubble, 300);

        return () => clearInterval(interval);
    }, [navigate]);

    function createBubble() {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        let size = Math.random() * 10 + 5; 
        bubble.style.width = `${size}px`;
        bubble.style.height = bubble.style.width;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.opacity = Math.random() * 0.5 + 0.5; 
        document.querySelector('.background').appendChild(bubble);
    
        setTimeout(() => {
            bubble.remove();
        }, 10000);
    }

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
            if (err.response && err.response.data.error) {
                setErrorMessage(err.response.data.error);
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className='background'>
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
