import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { Peer } from "peerjs";

function PythonRunner() {
  const [userCode, setCode] = useState("# Write your python code here...\n");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const id = localStorage.getItem("room-ID");
  const token = localStorage.getItem("token");

  const [peerID, setPeerID] = useState("");
  const remoteVideoRef = useRef(null);
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");

  const peerInstance = useRef(null);

  useEffect(() => {
    console.log("Creating peer");
    try {
      const peer = new Peer();
      console.log(peer);

      peer.on("open", function (id) {
        console.log("My peer ID is: " + id);
        setPeerID(id);
      }, []);

      peer.on("call", (call) => {
        //answer the call immediately
        call.answer(window.localStream);
        var getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia;
        getUserMedia({ video: true, audio: true }, (stream) => {
          call.answer(stream); // Answer the call with an A/V stream.
        });
      });

      peerInstance.current = peer;
    } catch (err) {
      console.log(err);
    }
  }, []);

  const call = (remotePeerID) => {
    var getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    getUserMedia(
      { video: true, audio: true },
      (stream) => {
        var call = peerInstance.current.call(remotePeerID, stream);
        call.on("stream", (remoteStream) => {
          // Show stream in some video/canvas element.
          console.log("Got remote stream");
          remoteVideoRef.current.srcObject = remoteStream;
        });
      },
      function (err) {
        console.log("Failed to get local stream", err);
      }
    );
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  useEffect(() => {
    (async () => {
      try {
        // Fetch code from DB
        const res = await axios.get(`http://localhost:4000/editor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCode(res.data.room.pythonCode);
      } catch (err) {
        console.log(err);
      }
    })();
  });

  const handleEditorChange = (value) => {
    // Store updated code into DB after every change
    setCode(value);
    (async () => {
      try {
        await axios.post(
          `http://localhost:4000/editor/${id}`,
          { code: value, lang: "python" },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        if (
          err.status === 401 ||
          err.error === "Failed to authenticate token"
        ) {
          navigate("/login");
        }
        console.log(err);
      }
    })();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setOutput("");
    setError("");
    try {
      const res = await axios.post(
        `http://localhost:4000/compile/python`,
        { code: userCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOutput(res.data.result);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="flex bg-gray-900 h-screen">
      <Sidebar />
      
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="">
          <div className="mt-24">
            <h2 className="text-2xl">Video Test</h2>
            <input
              value={remotePeerIdValue}
              onChange={(e) => setRemotePeerIdValue(e.target.value)}
              type="text"
              placeholder="Enter peer ID"
              className="bg-red-500"
            />
            <button onClick={() => call(remotePeerIdValue)}>Call</button>
            <div>
              <video ref={remoteVideoRef}></video>
            </div>
          </div>
          <h2 className="text-2xl">Python Interpreter</h2>
          <form onSubmit={handleSubmit} className="">
            <Editor
              height="65vh"
              width="120vh"
              defaultLanguage="python"
              theme="vs-dark"
              value={userCode}
              onChange={handleEditorChange}
            />
            <button type="submit">Run</button>
          </form>
          <div className="output-container">
            OUTPUT:
            {output && <pre>{output}</pre>}
            {error && <pre>{error}</pre>}
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Sign Out
          </button>
          <br />
        </div>
      </div>
    </div>
  );
}

export default PythonRunner;
