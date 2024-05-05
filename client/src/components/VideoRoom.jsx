import React from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";

// 007eJxTYNh4qXDDJGXXgCjuDrO6heZ6QfrnlBIkrvzZqn/Z6sszixAFhtTElCSzVENjk+Q0MxPDFEMLY0Mj0xQLcxMzcyNTQ0NLDRnztIZARoZTH1ewMjJAIIjPwlCSWlzCwAAA2lYdzA==

const appId = "eadb6e134cf641d183125d8746725119";
//const token = "006eadb6e134cf641d183125d8746725119IADwIOgAYd/pBQSpvsE28kVvy+Qj9xX+BRBdfB107xff/QSqNa4AAAAAEADOFL8AMUQ5ZgEAAQDBADhm";
//let channel = "sabah1250";
let token = "";
let channel = "";

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
    // get the channel token, and client
    const fetchTokenJoinChannel = async () => {
      try {
        channel = room;
        const response = await fetch(
          `http://localhost:8080/access_token?channelName=${channel}&role=audience`
        );
        const data = await response.json();
        console.log("data", data);
        token = data.token;
        channel = data.channelName;
        console.log("token", token);
        console.log("channel", channel);

        if (token && channel) {
          client.on("user-published", handleUserJoined);
          client.on("user-left", handleUserLeft);

          //join room here
          client
            .join(appId, channel, token, null)
            .then(
              (uid) =>
                Promise.all([AgoraRTC.createMicrophoneAndCameraTracks(), uid]) //promise chaining can probs turn this into async/await syntax
            )
            .then(([tracks, uid]) => {
              const [audioTrack, videoTrack] = tracks;
              setLocalTracks(tracks);
              setUsers((users) => [...users, { uid, videoTrack, audioTrack }]);
              client.publish(tracks);
            });
        } else {
          console.error("token or channel not found");
        }
      } catch (error) {
        console.error(error);
      }
    };
    // const {token, channel} = await fetchToken();
    // console.log("channel", channel);
    // console.log("token", token);
    fetchTokenJoinChannel();
    //channel = room;

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
