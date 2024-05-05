import React from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";

const appId = "8292d68d0c33475489ac94f69ebe8f73";
const token =
  "007eJxTYFhbX7DtZqVuofI3gT0v20JuPf48x3iyjn2Oa8vlFUedk5oUGCyMLI1SzCxSDJKNjU3MTU0sLBOTLU3SzCxTk1It0syNV7mZpTUEMjKsdJvBzMgAgSA+C0NJanEJAwMAqasgSQ==";
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
