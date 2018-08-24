/*
** AudioProcessor Interfaces
** constructor(_audioCtx)
** 
**
**
*/

import waitForms from 'utils/waitForms';
import toWav from 'audiobuffer-to-wav';

class AudioProcessor {
  constructor(audioCtx) {
    if (!audioCtx) {
      throw "Fatal Error: Could not instance AudioProcessor without an audioCtx";
    }
    this._audioCtx = audioCtx;
    this._gainNode = audioCtx.createGain();
    this.onStart = this.onStop = this.onLoad = () => {};
  }
  
  destructor() {
    clearInterval(this._handle);
    if (this._playing) {
      this._stop();
    }
  }
  
  loadSource = async source => {
    const raw = await fetch(source);
    const arrayBufer = await raw.arrayBuffer();
    const audioBuffer = await this._audioCtx.decodeAudioData(arrayBufer);
    this._bufferSource = this._audioCtx.createBufferSource();
    this._bufferSource.buffer = audioBuffer;
    this._bufferSource.loop = true;
    this._bufferSource.loopStart = 0;
    this._bufferSource.loopEnd = audioBuffer.duration;
    this._bufferSource.connect(this._gainNode);
    this._bufferSource.start();
    this._startOffset = 0;
    this._handle = setInterval(
      () => {
        const played = this.getPlayedOffset();
        if (played > this._bufferSource.loopEnd * 1000) {
          this._startOffset = this._bufferSource.loopStart * 1000;
        }
      },
      10
    );
    this.onLoad(audioBuffer);
  }
  
  togglePlay = () => {
    if (this._playing) {
      this._stop();
    } else {
      this._play();
    }
  }
  
  getAudioBuffer = () => {
    return this._bufferSource.buffer;
  }
  
  getPlayedOffset = () => {
    if (this._playing) {
      const now = Date.now();
      this._startOffset += now - this._startTiming;
      this._startTiming = now;
    }
    return this._startOffset;
  }
  
  getPlayedPercents = () => {
    const played = this.getPlayedOffset();
    return played / this._bufferSource.buffer.duration / 10;
  }
  
  getTimeFormPercents = percents => {
    return percents * this._bufferSource.buffer.duration * 10;
  }
  
  setLoopStart = async (
    start = this._bufferSource.loopStart * 1000,
  ) => {
    this._bufferSource.loopStart = start / 1000;
    const played = this.getPlayedOffset();
    if (played < start) {
      await this.jumpTo(start);
    }
  }
  
  setLoopEnd = async (
    end = this._bufferSource.loopEnd * 1000
  ) => {
    this._bufferSource.loopEnd = end / 1000;
    const played = this.getPlayedOffset();
    if (played > end) {
      await this.jumpTo(start);
    }
  }
  
  jumpTo = async start => {
    if (this._playing) {
      this._stop();
      await this._jumpToWhenPaused(start);
      this._play();
    } else {
      await this._jumpToWhenPaused(start);
    }
  }
  
  clipAudioBufferAsWav = (
    start = this._bufferSource.loopStart * 1000,
    end = this._bufferSource.loopEnd * 1000
  ) => {
    const {
      _audioCtx,
      _bufferSource: {
        loopStart,
        buffer
      }
    } = this;

    const timeSpan = (end - start) / 1000;
    const frameCount = buffer.sampleRate * timeSpan;
    const startFrame = parseInt(loopStart * buffer.sampleRate);
    const newClip = _audioCtx.createBuffer(2, frameCount, buffer.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      let channelData = buffer.getChannelData(channel);
      let newClipData = newClip.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        newClipData[i] = channelData[i + startFrame];
      }
    }
    
    return toWav(newClip);
  }
  
  mergeAnotherBufferAtStart = audioBuffer => {
    const {
      _audioCtx,
      _bufferSource: {
        buffer: thisBuffer
      }
    } = this;
    const timeSpan = Math.max(thisBuffer.duration, audioBuffer.duration);
    const frameCount = timeSpan * thisBuffer.sampleRate;
    const newClip = _audioCtx.createBuffer(2, frameCount, thisBuffer.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      let thisBufferData = thisBuffer.getChannelData(channel);
      let anotherData = audioBuffer.getChannelData(channel);
      let newClipData = newClip.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        newClipData[i] = (thisBufferData[i] || 0) + (anotherData[i] || 0);
      }
    }
    
    return toWav(newClip);
  }
  
  _play = () => {
    this._gainNode.connect(this._audioCtx.destination);
    this._startTiming = Date.now();
    this._playing = true;
    this.onStart();
  }
  
  _stop = () => {
    this._gainNode.disconnect();
    this._playing = false;
    this.onStop();
  }
  
  _jumpToWhenPaused = async start => {
    const played = this.getPlayedOffset();
    const beforeEnd = this._bufferSource.loopEnd;
    const beforeStart = this._bufferSource.loopStart;
    this._startOffset = start;
    this._gainNode.gain.value = 0;
    
    if (played > start) { // backward
      this._bufferSource.loopEnd = played / 1000;
      this._bufferSource.loopStart = start / 1000;
      this._gainNode.connect(this._audioCtx.destination);
      await waitForms(30);
      this._gainNode.disconnect();
    } else { // forward
      const seekTime = 200;
      this._bufferSource.playbackRate.value = (start - played) / seekTime;
      this._bufferSource.loopStart = start / 1000;
      this._bufferSource.loopEnd = start / 1000 + 0.01;
      this._gainNode.connect(this._audioCtx.destination);
      await waitForms(seekTime);
      this._gainNode.disconnect();
      this._bufferSource.playbackRate.value = 1;
    }
    this._bufferSource.loopStart = beforeStart;
    this._bufferSource.loopEnd = beforeEnd;
    this._gainNode.gain.value = 1;
  }
};

export default AudioProcessor;