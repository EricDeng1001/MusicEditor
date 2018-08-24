// @flow
import * as React from 'react';
import RecordTrack from 'components/RecordTrack';

import fileManager from 'service/fileManager';
import GetClipNameDialog from 'components/GetClipNameDialog';
import SoundTrackManager from 'components/SoundTrackManager';
import buttonMerge from 'images/btnMerge.png';
import styles from './MusicRecordPage.less';

type Props = {};

class Page extends React.Component<Props> {
  props: Props;
  state = {};
  
  render() {
    return (
      <div className={styles.root}>
        <RecordTrack
          ref={ref => this.first = ref}
        />
        <SoundTrackManager
          ref={ref => this.second = ref}
        />
        <img
          src={buttonMerge}
          className='button'
          onClick={this.handleMerge}
        />
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
      this.dialog.open();
    } catch (e) {
      alert('剪切缓冲数不足2，无法合成，请先进行剪切');
    }
  }
  
  handleSaveClip = name => {
    fileManager.saveAsMp3(name, this.clip);
  }
}

export default Page;
