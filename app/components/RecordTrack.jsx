// @flow
import * as React from 'react';
import fileManager from 'service/fileManager';
import MicrophoneProcessor from 'service/MicrophoneProcessor';
import SoundTrackManager from './SoundTrackManager';
import startRecord from 'images/startRecord.png';
import icon from 'images/ico-1.png';
import emptyTrack from 'images/emptyTrack.png';
import { canvasWidth, canvasHeight } from './SoundTrack';
import styles from './SoundTrackManager.less';

type Props = {};

class RecordTrack extends React.Component<Props> {
  props: Props;
  state = {
    record: '',
    start: null,
  }
  async componentDidMount() {
    try {
      this.microphoneProcessor = new MicrophoneProcessor(window.audioCtx);
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
            ref={ref => this.soundTrack = ref ? ref.soundTrack : null}
            audioSrc={this.state.record}
            onClear={() => this.setState({ record: '', start: false })}
          />
        </div>
      )
    }
    
    if (!this.state.start) {
      return (
        <div className={styles.root} style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <section>
            <img
              src={emptyTrack}
              width={canvasWidth}
              height={canvasHeight}
              style={{
                marginBottom: '22px',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
              }}
            >
              <img
                src={startRecord}
                onClick={() => {
                  this.setState({ start: true }, () => this.draw());
                  this.microphoneProcessor.start();
                }}
                className="button"
              />
              <span
                style={{
                  size: '22pt',
                  color: 'rgb(237, 56, 81)'
                }}
              >
                开始录音
              </span>
            </div>
          </section>
          <div
            style={{
              width: canvasWidth,
              borderTop: 'solid 1px lightgrey',
              paddingTop: '5px'
            }}
          >
            <img src={icon} />
            <span style={{ fontSize: '22px', color: 'rgb(117, 121, 145)'}}>
              点击右侧“+”，添加一条本地音乐进行剪切
            </span>
          </div>
        </div>
      )
    }
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row'
      }}>
        <canvas
          ref={ref => this.canvas = ref}
          width={canvasWidth}
          height={canvasHeight}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
          }}
        >
          <img
            src={startRecord}
            onClick={this.handleSaveRecord}
            className="button"
          />
          <span
            style={{
              size: '22pt',
              color: 'rgb(237, 56, 81)'
            }}
          >
            结束录音
          </span>
        </div>
      </div>
    )
  }
  
  componentWillUnmount() {
    cancelAnimationFrame(this.drawVisual);
    this.microphoneProcessor.stop();
    delete this.microphoneProcessor;
  }
  
  handleSaveRecord = () => {
    this.microphoneProcessor.stop();
    this.microphoneProcessor.getURL().then(url => 
      this.setState({
        record: url
      })
    );
  }
  
  draw = () => {
    const analyser = this.microphoneProcessor.analyser;
    if (!this.canvas) {
      return;
    }
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