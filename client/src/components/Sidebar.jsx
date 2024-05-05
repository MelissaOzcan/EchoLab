import React from "react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import VoiceChannel from "./VoiceChannel";
import io from "socket.io-client";
import "../index.css";

function Sidebar() {
    const [participants, setParticipants] = React.useState([]);
    const room = localStorage.getItem("room-ID");
    const user = localStorage.getItem("username");
    const navigate = useNavigate();
    const [showToast, setShowToast] = useState(false);    
    const token = localStorage.getItem("token");
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io('http://localhost:4000');
        handleParticipantsChange(participants)
        socketRef.current.on('updateParticipants', ({ channel, participants }) => {
            if (channel === room) {
                setParticipants(participants);
                fetchParticipants();
            }
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [room]);

    useEffect(() => {

        fetchParticipants();
    }, [room]);

    const fetchParticipants = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/editor/participants/${room}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setParticipants(response.data.participants);
        } catch (error) {
            console.error('Error fetching participants:', error);
        }
    }

    const handleParticipantsChange = (newParticipants)=> {
        setParticipants(newParticipants);
        socketRef.current.emit('updateParticipants', { channel: room, participants: newParticipants });
        fetchParticipants();
    };

    const copyRoomIdToClipboard = () => {
        navigator.clipboard.writeText(room).then(() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 800); // hide toast after 3 seconds
        }, () => {
            console.error('Failed to copy room ID');
        });
    };

    const handleLeaveRoom = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `http://localhost:4000/logout`,
                {
                    roomId: room,
                    username: user
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            console.log("room=")
            localStorage.removeItem("room-id");
            navigate("/login");
            handleParticipantsChange(participants);
        } catch (err) {
            console.log(err.response?.data?.error || "An error occurred");
        }
    }

    return (
        <div className="bg-gray-800 h-full w-64 px-4 py-2 bg-opacity-50">
            <div className="my-2 mb-4">
                <h1 className="text-2xl">EchoLab</h1>
                <h3 className="text-gray-400">Room:
                <button onClick={copyRoomIdToClipboard} className="text-sm text-black py-1 px-3 rounded mt-2">
                    Copy Room ID
                </button> 
                {room}</h3>
                {showToast && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-green-500 text-white px-4 py-2 rounded">
                            Room ID Copied!
                        </div>
                    </div>
                )}
                <br />
                <div>
                    <h3 className="text-gray-400">Participants</h3>
                    <ul>
                        {participants.map((participant, index) => (
                            <li key={index}>{participant}</li>
                        ))} 
                    </ul>
                </div>
            </div>
            <hr className="border-white-700" />
            <div>
                <VoiceChannel />
            </div>
            <hr className="border-white-700" />
            <div className="mt-4">
                <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded" onClick={handleLeaveRoom}>
                    Leave Room
                </button>
            </div>
            {/* 
            <button onClick={(e) => {
                handleLeaveRoom(e);
                localStorage.removeItem('token');
                navigate('/login');
            }} className="mt-4 bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded">
                Sign Out
            </button>
            */}
        </div>
    );
}

export default Sidebar;
