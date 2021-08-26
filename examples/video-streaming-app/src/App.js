import { useEffect, useRef, useState } from "react";
import { Presenter, Viewer } from "../../../index";
import "./App.css";

const viewer = new Viewer();

function App() {
  const videoRef = useRef(null);

  useEffect(() => {}, []);

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
          const presenter = new Presenter();

          window.navigator.getUserMedia(
            { audio: false, video: true },
            (stream) => handleSuccess(stream, presenter),
            console.error
          );
        }}
      >
        start streaming
      </button>
      <video ref={videoRef} autoPlay controls height="200px" width="300px" />
      <button onClick={startListening}>start listening</button>
    </div>
  );
}

export default App;
