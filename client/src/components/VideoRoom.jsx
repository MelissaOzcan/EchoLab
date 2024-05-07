
import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useState, useRef} from "react";
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
  const localTrack = useRef([]);
  const room = localStorage.getItem("room-ID");
  console.log("room id from video room:", room);
  console.log(localStorage);

  const handleUserJoined = async (user, mediaType) => {
    console.log("*********************************user joined", user);
    await client.subscribe(user, mediaType);

    // if (mediaType === "video") {
    //   setUsers((previousUsers) => [...previousUsers, user]);
    // }

    if (mediaType === "audio") {
      setUsers((previousUsers) => [...previousUsers, user]);
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
        let channel = room; // Ensure to declare channel using let instead of assigning to the global variable
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
          client
            .join(appId, channel, token, null)
            .then(
              (uid) =>
                Promise.all([AgoraRTC.createMicrophoneAudioTrack(), uid])
            )
            .then(([tracks, uid]) => {
              // const [audioTrack, videoTrack] = tracks;
              const audioTrack = tracks;
              // Store the local tracks in a ref
              localTrack.current = tracks;
              setLocalTracks(tracks);
              setUsers((users) => [...users, { uid, audioTrack }]);
              client.publish(tracks);
            });
        } else {
          console.error("token or channel not found");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTokenJoinChannel();

    return () => {
      // Check if local tracks exist before accessing them
      if (localTrack.current) {
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


  return (
    <div>
      {users.map((user) => (
        <VideoPlayer key={user.uid} user={user}/>
      ))}
    </div>
  );
};
