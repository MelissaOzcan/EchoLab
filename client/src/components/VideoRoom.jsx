import React from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";

const appId = "eadb6e134cf641d183125d8746725119";
const token =
  "007eJxTYAjrdHf+U9saHXhP+E2OyuXKyM9lEQYVLRIiqUZBOp2/XBUYUhNTksxSDY1NktPMTAxTDC2MDY1MUyzMTczMjUwNDS2vfjZOawhkZLhveomFkQECQXwWhpLU4hIGBgDk9B5E";
const channel = "test";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export const VideoRoom = () => {
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
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
      <h2>Video Room</h2>
      {/* {users.map((user) => (
        <VideoPlayer key={user.uid} user={user} />
      ))} */}
    </div>
  );
};
