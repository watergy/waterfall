import { useEffect, useRef, useState } from "react";
import { Presenter, Viewer } from "p2prtc";
// NOTE! Uncomment this line below (and comment out the
// line above) when you want to dev
// this will let you use the library that is in this repo
// instead of the one on npm.
// import { Presenter, Viewer } from "../../../index.js";
import "./App.css";

function App() {
  const videoRef = useRef(null);
  const [streamPrefix, setStreamPrefix] = useState("");

  useEffect(() => {
    const p = prompt("enter a chat ID");
    setStreamPrefix(p);
  }, []);

  const handleSuccess = (stream, presenter) => {
    if (videoRef?.current) {
      videoRef.current.srcObject = stream;
      presenter.startPresentingMedia(stream);
      console.log(presenter.peer.id);
    } else {
      throw new Error("no video ref");
    }
  };

  const startListening = async (e) => {
    e.preventDefault();
    const viewer = new Viewer(streamPrefix);

    const stream = await viewer.startViewingMedia();
    console.log(stream);
    if (videoRef?.current) {
      videoRef.current.srcObject = stream;
    } else {
      console.log("no current videoRef");
    }
  };

  return (
    <div className="App">
      <button
        onClick={async (e) => {
          e.preventDefault();
          const presenter = new Presenter(streamPrefix);

          window.navigator.getUserMedia(
            { audio: false, video: true },
            (stream) => handleSuccess(stream, presenter),
            console.error
          );
        }}
      >
        start streaming
      </button>
      <video ref={videoRef} autoPlay controls height="150px" width="300px" />
      <button onClick={startListening}>start listening</button>
    </div>
  );
}

export default App;
