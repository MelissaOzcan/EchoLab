import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VoiceChannel from "./VoiceChannel";
import { LuHome } from "react-icons/lu";
import { LuSettings2 } from "react-icons/lu";
import "../index.css";

function Sidebar() {
    let [participants, setParticipants] = React.useState([]);
    const room = localStorage.getItem("room-ID");
    const navigate = useNavigate();
    //leave room function
    const leaveRoom = () => {
        localStorage.removeItem("room-id");
        navigate("/login");
    };
    const token = localStorage.getItem("token");

    
    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/editor/participants/${room}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setParticipants(response.data.participants);
            } catch (error) {
                console.error('Error fetching participants:', error);
            }
        };

        fetchParticipants();
    }, [room]);

    return (
        <div className="bg-gray-800 h-full w-64 px-4 py-2 bg-opacity-50">
            <div className="my-2 mb-4">
                <h1 className="text-2xl">EchoLab</h1>
                <h2 className="text-gray-400">Room: {room}</h2>
                <div>
                    <h2 className="text-gray-400">Participants</h2>
                    <ul>
                        {participants.map((participant, index) => (
                            <li key={index}>{participant}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <hr className="border-gray-700" />
            <div>
                <ul className="mt-4">
                    <li className="text-white rounded hover:shadow py-2">
                        <a href="#" className="py-3">
                            <LuHome className="inline-block w-6 h-6 mr-2 -mt-2" />
                            Home
                        </a>
                    </li>
                    <li className="text-white rounded hover:shadow py-2">
                        <a href="#" className="py-3">
                            <LuSettings2 className="inline-block w-6 h-6 mr-2 -mt-2" />
                            Settings
                        </a>
                    </li>
                </ul>
            </div>
            <hr className="border-gray-700" />
            <div>
                <VoiceChannel />
            </div>
            <hr className="border-gray-700" />
            <div className="mt-4">
                <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded" onClick={leaveRoom}>
                    Leave Room
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
