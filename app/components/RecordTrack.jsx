// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import fileManager from 'service/fileManager';
import MicrophoneProcessor from 'service/MicrophoneProcessor';
import SoundTrackManager from './SoundTrackManager';
import { canvasWidth, canvasHeight } from './SoundTrack';

type Props = {};

class RecordTrack extends React.Component<Props> {
  props: Props;
  state = {
    record: null
  }
  async componentDidMount() {
    try {
      this.microphoneProcessor = new MicrophoneProcessor(window.audioCtx);
      await this.microphoneProcessor.start();
      this.draw();
    } catch (e) {
      this.e = e;
      this.forceUpdate();
    }
  }
  
  render() {
    if (this.e) {
      return (
        <div>
          发生了一个错误:{this.e.message}
        </div>
      )
    }
    
    if (this.state.record) {
      return (
        <div>
          <SoundTrackManager
            audioSrc={this.state.record}
            onClear={() => this.setState({ record: null })}
          />
        </div>
      )
    }
    return (
      <div>
        <canvas
          ref={ref => this.canvas = ref}
          width={canvasWidth}
          height={canvasHeight}
        />
        <Button
          onClick={this.handleSaveRecord}
        >
          保存录音
        </Button>
      </div>
    )
  }
  
  componentWillUnmount() {
    cancelAnimationFrame(this.drawVisual);
  }
  
  handleSaveRecord = async () => {
    this.microphoneProcessor.stop();
    this.setState({
      record: await this.microphoneProcessor.getURL()
    })
  }
  
  draw = () => {
    const analyser = this.microphoneProcessor.analyser;
    const canvasCtx = this.canvas.getContext('2d');
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    this.drawVisual = requestAnimationFrame(this.draw);
    analyser.getByteTimeDomainData(dataArray);
    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
    canvasCtx.beginPath();
    var sliceWidth = canvasWidth * 1.0 / bufferLength;
    var x = 0;
    for(var i = 0; i < bufferLength; i++) {
   
        var v = dataArray[i] / 128.0;
        var y = v * canvasHeight/2;
        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }
    canvasCtx.lineTo(canvasWidth, canvasHeight/2);
    canvasCtx.stroke();
  }
};

export default RecordTrack;