import React from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";

// 007eJxTYNh4qXDDJGXXgCjuDrO6heZ6QfrnlBIkrvzZqn/Z6sszixAFhtTElCSzVENjk+Q0MxPDFEMLY0Mj0xQLcxMzcyNTQ0NLDRnztIZARoZTH1ewMjJAIIjPwlCSWlzCwAAA2lYdzA==

const appId = "eadb6e134cf641d183125d8746725119";
const token = "007eJxTYMg3kXBmzG//m318fc1bx1YB5ger5tzQqTv91qj91xXuzoUKDKmJKUlmqYbGJslpZiaGKYYWxoZGpikW5iZm5kamhoaWwUrmaQ2BjAwpZyIZGKEQxGdhKEktLmFgAAA9ch6q";
let channel = "test";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export const VideoRoom = () => {
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  const room = localStorage.getItem("room-ID");
  console.log("room id from video room:", room);
  const handleUserJoined = async (user, mediaType) => {
    console.log("*********************************user joined", user);
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
      setUsers((previousUsers) => [...previousUsers, user]);
    }

    if (mediaType === "audio") {
      user.audioTrack.play();
    }
  };

  const handleUserLeft = (user) => {
    setUsers((previousUsers) =>
      previousUsers.filter((u) => u.uid !== user.uid)
    );
  };

  useEffect(() => {
    channel = room;
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);

    client
      .join(appId, channel, token, null)
      .then(
        (uid) => Promise.all([AgoraRTC.createMicrophoneAndCameraTracks(), uid]) //promise chaining can probs turn this into async/await syntax
      )
      .then(([tracks, uid]) => {
        const [audioTrack, videoTrack] = tracks;
        setLocalTracks(tracks);
        setUsers((users) => [...users, { uid, videoTrack, audioTrack }]);
        client.publish(tracks);
      });

    return () => {
      for (let localTrack of localTracks) {
        localTrack.stop();
        localTrack.close();
      }
      client.off("user-published", handleUserJoined);
      client.off("user-left", handleUserLeft);
      client.unpublish(tracks).then(() => {
        client.leave();
      });
    };
  }, []);

  return (
    <div>
      {users.map((user) => (
        <VideoPlayer key={user.uid} user={user} />
      ))}
    </div>
  );
};
