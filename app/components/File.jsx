// @flow
import * as React from 'react';
import upload from 'images/upload.png';
import download from 'images/download.png';
import play from 'images/play.png';
import Delete from 'images/delete.png';
import mp3 from 'images/mp3.png';
import selected from 'images/selected.png';
import notSelected from 'images/notSelected.png';
import fileManager from 'service/fileManager';
import AudioProcessor from 'service/AudioProcessor';
import fs from 'fs';
import path from 'path';
import styles from './File.less';

type Props = {
  filename: string,
  isLocal: boolean,
  isSelected: boolean,
  onDelete: () => void
}

class File extends React.Component<Props> {
  props: Props;
  state = {
    duration: -1
  };
  
  render() {
    const dir = this.props.isLocal ? fileManager.musicDir : fileManager.getTFCard();
    const file = fs.statSync(
      path.resolve(dir, `./${this.props.filename}.mp3`)
    );
    
    return (
      <div className={styles.root}>
        <div className={styles.time}>{file.mtime.toLocaleDateString()}</div>
        <img className={styles.selectIndicator}
          src={this.props.isSelected ? selected: notSelected}
          onClick={this.props.onSelect}
        />
        <img className={styles.icon}
          src={mp3}
        />
        <div className={styles.name}>{this.props.filename.slice(0,4)}</div>
        <div className={styles.duration}>{this.state.duration.toFixed(1)}s</div>
        <div className={styles.size}>{(file.size / 1024).toFixed(2)}kB</div>
        {
          this.props.isLocal ?
          <img className={styles.transfer}
            src={upload}
            onClick={() => {
              try {
                fileManager.uploadToTFCard(this.props.filename)
              } catch (e) {
                alert(e);
              }
            }}
          />
          :
          <img className={styles.transfer}
            src={download}
            onClick={() => {
              try {
                fileManager.downloadFromTFCard(this.props.filename)
              } catch (e) {
                alert(e);
              }
            }}
          />
        }
        
        <img className={styles.play}
          src={play}
          onClick={
            () => this.toggleMusic()
          }
        />
        <img className={styles.delete}
          src={Delete}
          onClick={
            () => fileManager.deleteFromMusicDir(this.props.filename) || this.props.onDelete()
          }
        />
      </div>
    )
  }
  
  toggleMusic() {
    if (this.audioProcessor) {
      this.audioProcessor.togglePlay();
    } else {
      let tmp = this.audioProcessor = new AudioProcessor(window.audioCtx);
      const fullPath = path.resolve(
        fileManager.musicDir,
        `./${this.props.filename}.mp3`
      );
      tmp.onLoad = audioBuffer => {
        tmp.togglePlay();
        this.setState({
          duration: audioBuffer.duration
        });
      }
      tmp.loadSource(fullPath)
    }
  }
}

export default File;