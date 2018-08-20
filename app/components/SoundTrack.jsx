// @flow
import * as React from 'react';
import AudioProcessor from 'service/AudioProcessor';
import fileManager from 'service/fileManager';
import waitForms from 'utils/waitForms';
import styles from './SoundTrack.less';

type Props = {
  audioSrc: string
}

export const canvasWidth = 800;
export const canvasHeight = 320;
export const cursorWidth = 3;
export const widthPercents = cursorWidth / canvasWidth * 100;

class SoundTrack extends React.Component<Props> {
  props: Props;
  state = {
    played: -1 // 仅用作ui展示，不能作为计算参考
  };
  dragger = [];
  cursor = [];
  getCanvas = ref => this.canvas = ref;
  getDragger = index => ref => this.dragger[index] = ref;
  getCursor = index => ref => this.cursor[index] = ref;
  
  constructor(props) {
    super(props);
    this.audioProcessor = new AudioProcessor(window.audioCtx);
    this.audioProcessor.onStart = this.startTicking;
    this.audioProcessor.onStop = this.stopTicking;
    this.audioProcessor.onLoad = this.drawBuffer;
    this.audioProcessor.loadSource(props.audioSrc);
  }
  
  render() {
    const {
      togglePlay,
      getDragger,
      getCursor,
      perpareDrag,
      drag,
      endDrag,
      getCanvas,
      filename,
      duration,
      state: {
        played
      }
    } = this;

    return (
      <div className={styles.root}>
        <div draggable
          onDragStart={perpareDrag(0)}
          onDrag={drag(0)}
          onDragEnd={endDrag(0)}
          ref={getDragger(0)}
          className={styles.cursor}
        />
        <div
          ref={getCursor(0)}
          className={styles.cursor}
        />
        <div draggable
          onDragStart={perpareDrag(1)}
          onDrag={drag(1)}
          onDragEnd={endDrag(1)}
          ref={getDragger(1)}
          className={styles.cursor}
        />
        <div
          ref={getCursor(1)}
          className={styles.cursor}
        />
        <div draggable
          onDragStart={perpareDrag(2)}
          onDrag={drag(2)}
          onDragEnd={endDrag(2)}
          ref={getDragger(2)}
          className={styles.processCursor}
        />
        <div
          ref={getCursor(2)}
          className={styles.processCursor}
        />
        <canvas
          ref={getCanvas}
          width={canvasWidth}
          height={canvasHeight}
        />
        <div className={styles.filename}>{filename}</div>
        <div className={styles.process}>{(played / 1000).toFixed(1)}s</div>
      </div>
    );
  }

  componentWillMount() {
    const { audioSrc } = this.props;
    this.filename = audioSrc.slice(
      audioSrc.lastIndexOf('\\') + 1,
      audioSrc.lastIndexOf('.')
    );
  }

  async componentDidMount() {
    const {
      canvas,
      perpareMusic,
      drawBuffer,
      cursor,
      dragger
    } = this;
    this.canvasCtx = canvas.getContext('2d');
    this.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    this.canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    dragger[0].style.left = cursor[0].style.left = '0%';
    dragger[1].style.left = cursor[1].style.left = `${100 - widthPercents}%`;
    dragger[2].style.left = cursor[2].style.left = '0%';
    dragger[0].style.width = cursor[0].style.width = `${cursorWidth}px`;
    dragger[1].style.width = cursor[1].style.width = `${cursorWidth}px`;
    dragger[2].style.width = cursor[2].style.width = `${cursorWidth}px`;
    dragger[0].style.zIndex = 3;
    dragger[1].style.zIndex = 3;
    dragger[2].style.zIndex = 3;
    this.setState({
      played: 0
    });
  }

  componentWillUnmount() {
    this.stopTicking();
    this.audioProcessor.destructor();
  }

  drawBuffer = async buffer => {
    const {
      canvasCtx
    } = this;
    
    const frameCount = buffer.duration * buffer.sampleRate;
    const framePerPx = frameCount / canvasWidth;


    canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();

    let leftChannel = buffer.getChannelData(0);
    let rightChannel = buffer.getChannelData(1);

    const drawRate = 1; // 每秒画几秒的音轨
    const framePerSecond = drawRate * buffer.sampleRate;
    // 1000 / drawTime * framePerPx === framePerSecond
    var drawTime = parseInt(1000 / framePerSecond * framePerPx);
    drawTime = Math.min(drawTime, 16); // 至少60 fps
    for (let i = 0; i < canvasWidth; i++) {
      const sampleFrame = parseInt(framePerPx * i);
      let mixed = (leftChannel[sampleFrame] + rightChannel[sampleFrame]) / 2;
      // from -1 to 1
      let y = (mixed + 1) * canvasHeight / 2;
      if (i == 0) {
        canvasCtx.moveTo(i, y);
      } else {
        canvasCtx.lineTo(i, y);
      }
      canvasCtx.stroke();
      await waitForms(drawTime); // 动画效果
    }
  }

  togglePlay = () => {
    this.audioProcessor.togglePlay();
  }

  startTicking = () => {
    const {
      cursor,
      dragger
    } = this;
    const processCursor = cursor[2];
    const processDragger = dragger[2];
    this.handle = setInterval(() => {
      const played = this.audioProcessor.getPlayedOffset();
      const percents = this.audioProcessor.getPlayedPercents();
      this.setState({ played });
      processCursor.style.left = processDragger.style.left = `${percents}%`;
    }, 100);
  }

  stopTicking = () => {
    clearInterval(this.handle);
  }

  jumpTo = async start => {
    await this.audioProcessor.jumpTo(start);
    this.setState({
      played: start
    });
  }

  perpareDrag = index => ev => {
    const {
      cursor,
      dragger
    } = this;

    dragger[index].style.opacity = 0;
    this.startOffsetX = ev.clientX;
  }

  drag = index => ev => {
    const {
      cursor,
      dragger,
      startOffsetX
    } = this;
    const diff = ev.clientX - startOffsetX;
    this.startOffsetX = ev.clientX;
    const diffPercents = diff / canvasWidth * 100;
    if (diffPercents > 2 || diffPercents < -2) { // not too fast
      return;
    }
    const style = cursor[index].style;
    const originLeft = parseFloat(style.left);
    var percents = originLeft + diffPercents;
    if (percents < 0) {
      percents = 0;
    }
    if (percents > 100 - widthPercents) {
      percents = 100 - widthPercents;
    }

    const leftLimit = parseFloat(cursor[0].style.left);
    const rightLimit = parseFloat(cursor[1].style.left);

    switch (index) {
      case 0:
        if (percents > rightLimit - widthPercents) {
          percents = rightLimit - widthPercents;
        }
        break;
      case 1:
        if (percents < leftLimit + widthPercents) {
          percents = leftLimit + widthPercents;
        }
        break;
      case 2:
        if (percents > rightLimit) {
          percents = rightLimit;
        }
        if (percents < leftLimit) {
          percents = leftLimit;
        }
        break;
    }
    dragger[index].style.left = `${percents}%`;
    this.cursor[index].style.left = `${percents}%`;
  }

  endDrag = index => async ev => {
    const {
      cursor,
      dragger
    } = this;
    const percents = parseFloat(cursor[index].style.left);
    const time = this.audioProcessor.getTimeFormPercents(percents);
    switch (index) {
      case 0:
        this.audioProcessor.setLoop(time, undefined);
        break;
      case 1:
        this.audioProcessor.setLoop(undefined, time);
        break;
      case 2:
        await this.audioProcessor.jumpTo(time);
        break;
    }
    dragger[index].style.opacity = 1;
  }

  clip = () => {
    this.newClip = this.audioProcessor.clipAudioBufferAsWav();
  }

  saveClip = clipName => {
    fileManager.saveAsMp3(clipName, this.newClip);
  }

}

export default SoundTrack;
