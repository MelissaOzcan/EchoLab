import React from "react";
import { useEffect, useRef } from "react";

export const VideoPlayer = ({ user, username }) => {
  const ref = useRef();
  useEffect(() => {
    user.videoTrack.play(ref.current);
    console.log("playing video track");
  }, []);

  return (
    <div>
      Uid: {user.uid}
      {/* Username: {username} */}
      <div
        ref={ref}
        style={{ width: '200px', height: '200px' }}
      ></div>
    </div>
  );
};
