import React from "react";
import VoiceChannel from "./VoiceChannel";
import { LuHome } from "react-icons/lu";
import { LuSettings2 } from "react-icons/lu";
import '../index.css';

function Sidebar() {
  const room = localStorage.getItem("room-ID");
  console.log(room);

  return (
    <div className="bg-gray-800 bg-opacity-50 w-64 h-full px-4 py-2 flex flex-col">
      <div className="my-2 mb-4">
        <h1 className="text-2xl text-red-500">EchoLab</h1>
        <h2 className="text-gray-400">Room: {room}</h2>
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
        <VoiceChannel/>
      </div>
      <hr className="border-gray-700" />
        <div className="mt-4">
            <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
            Leave Room
            </button>
        </div>
    </div>
  );
}

export default Sidebar;
