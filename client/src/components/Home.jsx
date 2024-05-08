import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Echo from '../assets/Echo.png';

function Home() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [roomId, setRoomId] = useState('');
    const username = localStorage.getItem('username')
    const token = localStorage.getItem('token');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        if (!token) {
            navigate('/login');
        }
        const interval = setInterval(createBubble, 300);

        return () => clearInterval(interval);
    }, [token, navigate]);

    function createBubble() {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        let size = Math.random() * 15 + 10;
        bubble.style.width = `${size}px`;
        bubble.style.height = bubble.style.width;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.opacity = Math.random() * 0.5 + 0.5;
        document.querySelector('.background-static-home').appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, 10000);
    }


    const handleSubmitCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://3.142.174.77:4000/home', { username: username }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const id = res.data.newRoom._id;
            localStorage.setItem('room-ID', id)
            navigate(`/editor/${id}/room`)
        } catch (err) {
            setError('Something went wrong. Please try again!');
        }
    };

    const handleSubmitJoin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://3.142.174.77:4000/home/join`, { roomId: roomId, username: username }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const id = res.data.room._id
            localStorage.setItem('room-ID', id)
            navigate(`/editor/${id}/room`)
        } catch (err) {
            setError('Something went wrong. Please try again!');
        }
    };

    const handleDeleteUser = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.delete(`http://3.142.174.77:4000/deleteuser/${username}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            localStorage.removeItem('token');
            navigate('/login');
        } catch (err) {
            setError('Something went wrong. Please try again!');
            console.log(err.response?.data?.error || "An error occurred while deleting the user");
        }
    };

    return (
        <div className='background-static-home'>
            <div className="App-header">
                <img src={Echo} className="App-logo" alt="logo" />
            </div>
            <div className='form-container'>
                <ul>
                    <h2>Welcome, {username}!</h2>
                    <form onSubmit={handleSubmitJoin}>
                        <li>Room ID:
                            <br />
                            <input id='room-id' value={roomId} onChange={(e) => setRoomId(e.target.value)} /> </li>
                        <br />
                        <button type="submit">Join Room</button>
                    </form>
                    <li>
                        <li><form onSubmit={handleSubmitCreate}>
                            <button type="submit">Create New Room</button>
                        </form></li>
                        <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded" onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login');
                        }}>Sign Out</button></li>
                    <div className="mt-4">
                        <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded" onClick={handleDeleteUser}>
                            Delete User
                        </button>
                    </div>
                    <p>{error}</p>
                </ul>
            </div>
        </div>
    );
}

export default Home;
