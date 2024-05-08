import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useState, useRef } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { LuMic } from "react-icons/lu";
import { LuMicOff } from "react-icons/lu";
//import { m } from "framer-motion";

// 007eJxTYNh4qXDDJGXXgCjuDrO6heZ6QfrnlBIkrvzZqn/Z6sszixAFhtTElCSzVENjk+Q0MxPDFEMLY0Mj0xQLcxMzcyNTQ0NLDRnztIZARoZTH1ewMjJAIIjPwlCSWlzCwAAA2lYdzA==

const appId = "eadb6e134cf641d183125d8746725119";
let token = "";
let channel = "";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export const VideoRoom = () => {
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  const localTrack = useRef([]);
  const room = localStorage.getItem("room-ID");
  const [micMuted, setmicMuted] = useState(true);

  console.log("room id from video room:", room);
  console.log(localStorage);

  const handleUserJoined = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    const userExists = users.some((u) => u.uid === user.uid);

    if (!userExists) {
      if (mediaType === "audio") {
        setUsers((previousUsers) => [...previousUsers, user]);
        user.audioTrack.play();
        // user.audioTrack.setMuted(micMuted);
      }
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
        // checkMicrophonePermission();

        let channel = room; 
        const response = await fetch(
          `http://localhost:8080/access_token?channelName=${channel}&role=audience`
        );
        const data = await response.json();
        console.log("data", data);
        const token = data.token;
        channel = data.channelName;
        console.log("token", token);
        console.log("channel", channel);

        if (token && channel) {
          client.on("user-published", handleUserJoined);
          client.on("user-left", handleUserLeft);

          //join room here
          // client
          //   .join(appId, channel, token, null)
          //   .then((uid) =>
          //     Promise.all([AgoraRTC.createMicrophoneAudioTrack(), uid])
          //   )
          //   .then(([tracks, uid]) => {
          //     // const [audioTrack, videoTrack] = tracks;
          //     const audioTrack = tracks;
          //     localTrack.current = tracks;
          //     // tracks.setMuted(micMuted);
          //     console.log("currently mic muted is", micMuted);
          //     setLocalTracks(tracks);
          //     setUsers((users) => [...users, { uid, audioTrack }]);
          //     client.publish(tracks);
          //   });
          const [tracks, uid] = await Promise.all([
            AgoraRTC.createMicrophoneAudioTrack(),
            client.join(appId, channel, token, null),
          ]);
          const audioTrack = tracks;
          localTrack.current = tracks;
          console.log("currently mic muted is", micMuted);
          setLocalTracks(tracks);
          // setUsers((users) => [...users, { uid, audioTrack }]);
          setUsers((users) => {
            // Check if the UID already exists in the users array
            const userExists = users.some(user => user.uid === uid);
            
            // If the user doesn't exist, add it to the users array
            if (!userExists) {
              return [...users, { uid, audioTrack }];
            } else {
              // If the user already exists, return the unchanged users array
              return users;
            }
          });
          client.publish(tracks);
          toggleMicrophonePermission();
          toggleMicrophonePermission();
        } else {
          console.error("token or channel not found");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTokenJoinChannel();

    return () => {
      if (localTrack.current && localTrack.current.length > 0) {
        console.log("local track", localTrack.current);
        localTrack.current.stop();
        localTrack.current.close();
        // localTrack.current.forEach((track) => {
        //   // Stop and close each local track
        //   track.stop();
        //   track.close();
        // });
      }

      client.off("user-published", handleUserJoined);
      client.off("user-left", handleUserLeft);

      // Unpublish the local tracks
      if (localTrack.current) {
        client.unpublish(localTrack.current).then(() => {
          client.leave();
        });
      }
    };
  }, [room]);

  const toggleMicrophonePermission = () => {
    if (micMuted) {
      console.log("mic is muted");
      localTrack.current.setMuted(false);
      // localTrack.current.audioTrack.play();
      setmicMuted(false);
    } else {
      console.log("mic is unmuted");
      localTrack.current.setMuted(true);
      // localTrack.current.audioTrack.stop();
      setmicMuted(true);
    }
    // localTrack.current.setMuted(micMuted);
  };

  return (
    <div>
      <div onClick={toggleMicrophonePermission}>
        {micMuted ? (
          <div className="text-red-500 text-2xl mb-4">
            <div>
              <LuMicOff className="inline-block" size={30} />
            </div>
            <div>Muted</div>
          </div>
        ) : (
          <div className="text-green-500 text-2xl mb-4 gap-4">
            <div>
              <LuMic className="inline-block" size={30} />
            </div>
            <div>Unmuted</div>
          </div>
        )}
      </div>
      {users.map((user) => (
        <VideoPlayer key={user.uid} user={user} />
      ))}
    </div>
  );
};
