// @flow
import * as React from 'react';
import { remote } from 'electron';
import Button from '@material-ui/core/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import GetClipNameDialog from 'components/GetClipNameDialog';
import SoundTrack, { canvasWidth, canvasHeight } from 'components/SoundTrack';
import emptyTrack from './emptyTrack.jpg';
import styles from './SoundTrackManager.less';

type Props = {};

class SoundTrackManager extends React.Component<Props> {
  props: Props;
  state = {
    audioSrc: ''
  };
  constructor(props) {
    super(props);
    if (props.audioSrc) {
      this.state.audioSrc = props.audioSrc;
    }
  }

  render() {
    const {
      getAudioSrc,
      clearAudioSrc,
      handleTogglePlay,
      handleRewind,
      handleClip,
      handleSaveClip,
      state: {
        audioSrc
      }
    } = this;

    if (!audioSrc) {
      return (
        <div className={styles.root}>
          <section>
            <img
              src={emptyTrack}
              width={canvasWidth}
              height={canvasHeight}
            />
            <Button
              variant='fab'
              color='primary'
              onClick={getAudioSrc}
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </section>
        </div>
      )
    }

    return (
      <div className={styles.root}>
        <section>
          <SoundTrack
            key={audioSrc}
            audioSrc={audioSrc}
            ref={ref => this.soundTrack = ref}
          />
          <Button
            variant='fab'
            color='secondary'
            onClick={clearAudioSrc}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </Button>
        </section>
        <section
          style={{ width: canvasWidth }}
        >
          <Button
            variant='contained'
            color='primary'
            onClick={handleClip}
          >
            裁剪选中片段
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={() => this.dialog.open()}
          >
            保存到文件
          </Button>
        </section>
        <GetClipNameDialog
          ref={ref => this.dialog = ref}
          action={handleSaveClip}
        />
      </div>
    );
  }

  getAudioSrc = () => {
    remote.dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {
          name: 'music',
          extensions: ['mp3','wav']
        }
      ]
    }, files => {
      if (!files) {
        return;
      }
      this.setState({
        audioSrc: files[0]
      })
    });
  }

  clearAudioSrc = () => {
    this.setState({
      audioSrc: ''
    });
    if (this.props.onClear) {
      this.props.onClear();
    }
  }

  handleTogglePlay = () => {
    this.soundTrack.togglePlay();
  }

  handleClip = () => {
    this.soundTrack.clip();
    remote.dialog.showMessageBox({
      title: '成功',
      message: '已保存到临时空间'
    });
  }

  handleSaveClip = clipName => {
    this.soundTrack.saveClip(clipName);
    remote.dialog.showMessageBox({
      title: '成功',
      message: `已保存到文件:${clipName}.wav`
    });
  }

}

export default SoundTrackManager;
