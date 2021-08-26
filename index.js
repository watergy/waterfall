import Peer from "peerjs";
import Gun from "gun";
import "gun/lib/load.js";

const prefix = "applebeedog";
const ids = [
  "b1",
  "b2",
  "b3",
  "b4",
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7",
  "c8",
  "c9",
  "c10",
  "c11",
  "c12",
  "c13",
  "c14",
  "c15",
  "c16",
];
const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
};

const createEmptyVideoTrack = ({ width, height }) => {
  const canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  canvas.getContext("2d").fillRect(0, 0, width, height);

  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];

  return Object.assign(track, { enabled: false });
};

export class Presenter {
  constructor(opts = {}) {
    // the presenter is always A1
    this.peer = new Peer(prefix + "A1", { host: "localhost", port: 9000 });
    this.activeConnections = 0;
  }
  async startPresentingMedia(stream, opts) {
    console.log(this.peer);
    if (this.peer.disconnected) throw new Error("peerjs not connected");
    this.peer.on("call", (call) => {
      console.log("incoming call", call);
      console.log(this.activeConnections);
      if (this.activeConnections < 4) {
        call.answer(stream);
        this.activeConnections += 1;
      } else {
        call.close();
      }
    });
  }
}

export class Viewer {
  constructor(opts = {}) {
    this.peer = null;
    this.index = 0;
    this.stream = null;
  }
  async startViewingMedia() {
    return new Promise(async (resolve, reject) => {
      // try to get a Peer ID starting with B1, B2..
      this.stream = await this.tryToConnect();
      resolve(this.stream);
    });
  }

  async tryToConnect() {
    return new Promise((resolve, reject) => {
      const peer = new Peer(ids[this.index], { host: "localhost", port: 9000 });
      peer.on("error", (e) => {
        console.log(e);
        this.index += 1;
        resolve(this.tryToConnect());
      });
      peer.on("open", (conn) => {
        console.log(conn);
        console.log(peer.id);
        if (peer.id.startsWith("b")) {
          console.log("trying to call A");
          // try calling A
          const call = peer.call(
            prefix + "A1",
            new MediaStream([
              createEmptyAudioTrack(),
              createEmptyVideoTrack({ width: 640, height: 480 }),
            ])
          );
          call.on("stream", (stream) => {
            console.log(stream);
            resolve(stream);
          });

          call.on("error", console.error);
        } else if (peer.id.startsWith("c")) {
          // try calling b1, then b2, then b3, b4
        }
      });
      if (this.index >= 15) {
        alert("no spots open");
        reject("no open spots");
      }
    });
  }
}
