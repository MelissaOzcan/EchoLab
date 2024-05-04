import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Echo from '../assets/Echo.png';

function Register() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/lang/python');
        }

        const interval = setInterval(createBubble, 300);

        return () => clearInterval(interval);
    }, [navigate]);

    function createBubble() {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        let size = Math.random() * 15 + 10; 
        bubble.style.width = `${size}px`;
        bubble.style.height = bubble.style.width;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.opacity = Math.random() * 0.5 + 0.5; 
        document.querySelector('.background-static').appendChild(bubble);
    
        setTimeout(() => {
            bubble.remove();
        }, 10000);
    }

    const handleChange = (e) => {
        setUserData({...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/register', userData);
            navigate("/login");
        } catch (err) {
            if (err.response.data.error) {
                console.log(err)
                setErrorMessage(err.response.data.error);
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
            console.error(err);
        }
    };

    return (
        <div className='background-static'>
            <div className="App-header">
               <img src={Echo} className="App-logo" alt="logo" />
             </div>
            <div className='form-container'>
            <h1>Register</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <form onSubmit={handleSubmit}>
                <input
                type="text"
                name="username"
                placeholder="Username"
                value={userData.username}
                onChange={handleChange}
                />
                <br/>
                <input
                type="email"
                name="email"
                placeholder="Email"
                value={userData.email}
                onChange={handleChange}
                />
                <br/>
                <input
                type="password"
                name="password"
                placeholder="Password"
                value={userData.password}
                onChange={handleChange}
                />
                <br/>
                <button className='form-button' type="submit">Register</button>
                </form>
            <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
        </div>
    );
}

export default Register;
