// @flow
import * as React from 'react';
import AudioProcessor from 'service/AudioProcessor';
import fileManager from 'service/fileManager';
import waitForms from 'utils/waitForms';
import sliderRight from 'images/sliderRight.png';
import sliderLeft from 'images/sliderLeft.png';
import styles from './SoundTrack.less';

type Props = {
  audioSrc: string
}

export const canvasWidth = 1322;
export const canvasHeight = 300;
export const cursorWidth = 26;
export const widthPercents = cursorWidth / canvasWidth * 100;

class SoundTrack extends React.Component<Props> {
  props: Props;
  state = {
    played: -1,
    selected: -1// 仅用作ui展示，不能作为计算参考
  };
  dragger = [];
  cursor = [];
  getCanvas = ref => this.canvas = ref;
  getDragger = index => ref => this.dragger[index] = ref;
  getCursor = index => ref => this.cursor[index] = ref;
  getSliderIndicator = ref => this.sliderIndicator = ref;
  
  constructor(props) {
    super(props);
    this.audioProcessor = new AudioProcessor(window.audioCtx);
    this.audioProcessor.onStart = this.startTicking;
    this.audioProcessor.onStop = this.stopTicking;
    this.audioProcessor.onLoad = buffer => {
      this.drawBuffer(buffer);
      this.audioProcessor.togglePlay();
      this.setState({
        selected: this.audioProcessor.getAudioBuffer().duration
      })
    };
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
      duration,
      state: {
        played,
        selected
      }
    } = this;
    
    
    return (
      <div className={styles.root}>
        <div
          ref={this.getSliderIndicator}
          className={styles.sliderIndicator}
        >
          {selected.toFixed(1)}s
        </div>
        <div draggable
          onDragStart={perpareDrag(0)}
          onDrag={drag(0)}
          onDragEnd={endDrag(0)}
          ref={getDragger(0)}
          className={styles.cursor}
          style={{
            backgroundImage: `url(${sliderLeft})`
          }}
        />
        <div
          ref={getCursor(0)}
          className={styles.cursor}
          style={{
            backgroundImage: `url(${sliderLeft})`
          }}
        />
        <div draggable
          onDragStart={perpareDrag(1)}
          onDrag={drag(1)}
          onDragEnd={endDrag(1)}
          ref={getDragger(1)}
          className={styles.cursor}
          style={{
            backgroundImage: `url(${sliderRight})`
          }}
        />
        <div
          ref={getCursor(1)}
          className={styles.cursor}
          style={{
            backgroundImage: `url(${sliderRight})`
          }}
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
      </div>
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
    this.sliderIndicator.style.width = `${canvasWidth - 2 * cursorWidth}px`;
    this.sliderIndicator.style.left = `${widthPercents}%`;
    dragger[0].style.left = cursor[0].style.left = '0%';
    dragger[1].style.left = cursor[1].style.left = `${100 - widthPercents}%`;
    dragger[2].style.left = cursor[2].style.left = '0%';
    dragger[2].style.width = cursor[2].style.width = '3px';
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
    let rightChannel = []; //buffer.getChannelData(1);

    const drawRate = 1; // 每秒画几秒的音轨
    const framePerSecond = drawRate * buffer.sampleRate;
    // 1000 / drawTime * framePerPx === framePerSecond
    var drawTime = parseInt(1000 / framePerSecond * framePerPx);
    drawTime = Math.min(drawTime, 8); // 至少120 fps
    for (let i = 0; i < canvasWidth; i++) {
      const sampleFrame = parseInt(framePerPx * i);
      let mixed = (leftChannel[sampleFrame] + rightChannel[sampleFrame] || leftChannel[sampleFrame]) / 2;
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
    this.sliderIndicator.style.left = 
    `${parseFloat(dragger[0].style.left) + widthPercents}%`;
    this.sliderIndicator.style.width =
      `${(parseFloat(dragger[1].style.left) - parseFloat(dragger[0].style.left) ) / 100 * canvasWidth - cursorWidth}px`;
  }

  endDrag = index => ev => {
    const {
      cursor,
      dragger
    } = this;
    const percents = parseFloat(cursor[index].style.left);
    const time = this.audioProcessor.getTimeFormPercents(percents);
    switch (index) {
      case 0:
        this.audioProcessor.jumpTo(time).then(() =>
        this.audioProcessor.setLoopStart(time));
        break;
      case 1:
        this.audioProcessor.setLoopEnd(time);
        break;
      case 2:
        this.audioProcessor.jumpTo(time);
        break;
    }
    dragger[index].style.opacity = 1;
    this.setState({
      selected: this.audioProcessor.getAudioBuffer().duration * ((parseFloat(dragger[1].style.left) - parseFloat(dragger[0].style.left)) / 100)
    })
  }

  clip = () => {
    this.newClip = this.audioProcessor.clipAudioBufferAsWav();
  }

  saveClip = clipName => {
    fileManager.saveAsMp3(clipName, this.newClip);
  }

}

export default SoundTrack;
