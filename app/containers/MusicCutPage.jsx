// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import fileManager from 'service/fileManager';
import SoundTrackManager from 'components/SoundTrackManager';
import GetClipNameDialog from 'components/GetClipNameDialog';
import styles from './MusicCutPage.less';

type Props = {};

class Page extends React.Component {
  props: Props;

  render() {
    return (
      <div className={styles.root}>
        <SoundTrackManager
          ref={ref => this.first = ref}
        />
        <SoundTrackManager
          ref={ref => this.second = ref}
        />
        <Button
          onClick={this.handleMerge}
          variant='contained'
          color='primary'
        >
          合成
        </Button>
        <GetClipNameDialog
          ref={ref => this.dialog = ref}
          action={this.handleSaveClip}
        />
      </div>
    );
  }
  
  handleMerge = () => {
    try {
      this.clip = this.first.soundTrack.audioProcessor.mergeAnotherBufferAtStart(
        this.second.soundTrack.audioProcessor.getAudioBuffer()
      );
    } catch (e) {
      alert(e);
    }
  }
  
  handleSaveClip = name => {
    fileManager.saveAsMp3(name, this.newClip);
  }
}

export default Page;
