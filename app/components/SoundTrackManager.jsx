// @flow
import * as React from 'react';
import { remote } from 'electron';
import Button from '@material-ui/core/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import GetClipNameDialog from 'components/GetClipNameDialog';
import SoundTrack, { canvasWidth, canvasHeight } from 'components/SoundTrack';
import emptyTrack from 'images/emptyTrack.png';
import icon from 'images/ico-1.png';
import buttonAdd from 'images/btnAdd.png';
import buttonDelete from 'images/btnDelete.png';
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
                src={buttonAdd}
                onClick={getAudioSrc}
                className="button"
              />
              <span
                style={{
                  size: '22pt',
                  color: 'rgb(237, 56, 81)'
                }}
              >
                添加音乐
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
      <div className={styles.root}>
        <section>
          <SoundTrack
            key={audioSrc}
            audioSrc={audioSrc}
            ref={ref => this.soundTrack = ref}
          />
          <img
            className='button'
            src={buttonDelete}
            onClick={this.clearAudioSrc}
          />
        </section>
        <section
          style={{
            width: canvasWidth,
            borderTop: 'solid 1px lightgrey',
            paddingTop: '5px'
          }}
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
  }

}

export default SoundTrackManager;
