import React from "react";
import { LuPhone } from "react-icons/lu";
import { useState } from "react";
import {VideoRoom} from "./VideoRoom";

const VoiceChannel = () => {
  const [joined, setJoined] = useState(false);
  const toggleJoin = () => setJoined(!joined);
  return (
    <div className="mt-4 mb-4">
      <div href="">
        <LuPhone className="inline-block w-6 h-6 mr-2 -mt-2" />
        <button onClick={toggleJoin} className=""> {joined ? "Leave Voice Channel" : "Join Voice Channel"} </button>
      </div>
      <div>
        {joined && (
          <div className="mt-2">
            <p className="text-black">Voice Channel: General</p>
            <VideoRoom/>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChannel;
