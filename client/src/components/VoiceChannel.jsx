import React from "react";
import { LuPhone } from "react-icons/lu";
import { useState } from "react";

const VoiceChannel = () => {
  const [voiceChannel, setVoiceChannel] = useState(false);
  return (
    <div className="mt-4 mb-4">
      <a href="">
        <LuPhone className="inline-block w-6 h-6 mr-2 -mt-2" />
        Join Voice Channel
      </a>
    </div>
  );
};

export default VoiceChannel;
