import Peer from "peerjs";

const ids = [
  "a1",
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
  "d1",
  "d2",
  "d3",
  "d4",
  "d5",
  "d6",
  "d7",
  "d8",
  "d9",
  "d10",
  "d11",
  "d12",
  "d13",
  "d14",
  "d15",
  "d16",
  "d17",
  "d18",
  "d19",
  "d20",
  "d21",
  "d22",
  "d23",
  "d24",
  "d25",
  "d26",
  "d27",
  "d28",
  "d29",
  "d30",
  "d31",
  "d32",
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
  constructor(prefix, opts = {}) {
    // the presenter is always A1
    this.peer = new Peer(prefix + "a1");
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
  constructor(prefix, opts = {}) {
    this.peer = null;
    this.index = 0;
    this.stream = null;
    this.activeConnections = 0;
    this.callingIndex = 0;
    this.prefix = prefix;
  }
  async startViewingMedia() {
    return new Promise(async (resolve, reject) => {
      // try to get a Peer ID starting with B1, B2..
      this.stream = await this.tryToConnect();

      resolve(this.stream);
    });
  }

  async tryToConnect() {
    return new Promise(async (resolve, reject) => {
      const peer = new Peer(this.prefix + ids[this.index]);
      this.peer = peer;
      this.peer.on("error", async (e) => {
        console.log(e);
        this.index += 1;
        resolve(await this.tryToConnect());
      });
      this.peer.on("open", async (conn) => {
        console.log(conn);
        console.log(peer.id);
        this.peer.on("call", (call) => {
          console.log("call from", call);
          if (this.activeConnections < 4) {
            console.log("answering call", call);
            call.answer(this.stream);
            this.activeConnections += 1;
          } else {
            console.log("declining call", call);
            call.close();
          }
        });
        const stream = await this.startMakingCalls(peer);
        this.stream = stream;
        resolve(stream);
      });

      if (this.index >= ids.length - 1) {
        reject("no open spots");
      }
    });
  }

  async startMakingCalls(peer) {
    let streamIsIncoming = false;
    return new Promise(async (resolve, reject) => {
      const peerId = this.prefix + ids[this.callingIndex];
      console.log("trying to call", peerId);
      const call = peer.call(
        peerId,
        new MediaStream([
          createEmptyAudioTrack(),
          createEmptyVideoTrack({ width: 640, height: 480 }),
        ])
      );
      call.on("stream", (stream) => {
        streamIsIncoming = true;
        console.log(stream);
        this.activeConnections = 0;
        resolve(stream);
      });
      call.on("close", async () => {
        console.log("it closed");
        this.callingIndex += 1;
        reslove(await this.startMakingCalls(peer));
      });
      call.on("error", (err) => {
        this.callingIndex += 1;

        console.log("it errored", err);
      });

      setTimeout(async () => {
        if (!streamIsIncoming) {
          this.callingIndex += 1;
          resolve(await this.startMakingCalls(peer));
        }
      }, 500);
    });
  }
}
