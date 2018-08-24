// @flow
import Recorder from 'utils/recorder';

class MicrophoneProcessor {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;
    this.analyser = audioCtx.createAnalyser();
    this.analyser.connect(audioCtx.destination);
  }
  
  async start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.source = this.audioCtx.createMediaStreamSource(stream);
    this.recorder = new Recorder(this.source);
    this.recorder.record();
    this.source.connect(this.analyser);
  }
  
  stop() {
    if (this.recorder) {
      this.recorder.stop();
      this.source.disconnect();
    }
  }
  
  getURL() {
    return new Promise(resolve => {
      this.recorder.exportWAV(wav => {
        resolve(URL.createObjectURL(wav));
      })
    })
  }
};

export default MicrophoneProcessor;