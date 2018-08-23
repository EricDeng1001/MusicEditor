// @flow
import * as React from 'react';
import path from 'path';
import AudioProcessor from 'service/AudioProcessor';
import fileManager from 'service/fileManager';
import Button from '@material-ui/core/Button';
import ClipDestination from 'components/ClipDestination';
type Props = {};

class Page extends React.Component {
  props: Props;
  audioProcessors = {};
  render() {
    return (
      <div>
        <ClipDestination
          onChange={() => this.forceUpdate()}
        />
        <div>
          {
            fileManager.readMusicFromMusicDir().map(
              mp3 => (
                <div key={mp3}>
                  <div>{mp3}</div>
                  <Button
                    onClick={() => {
                      try {
                        fileManager.uploadToTFCard(mp3)
                      } catch (e) {
                        alert(e);
                      }
                    }}
                  >
                    上传到声卡
                  </Button>
                  <Button
                    onClick={
                      () => fileManager.deleteFromMusicDir(mp3) || this.forceUpdate()
                    }
                  >
                    删除
                  </Button>
                  <Button
                    onClick={
                      () => this.toggleMusic(mp3)
                    }
                  >
                    试听/暂停
                  </Button>
                </div>
              )
            )
          }
        </div>
      </div>
    );
  }
  
  toggleMusic(filename) {
    const fullPath = path.resolve(
      fileManager.musicDir,
      `./${filename}.mp3`
    );
    if (!this.audioProcessors[filename]) {
      let tmp = this.audioProcessors[filename] = new AudioProcessor(window.audioCtx);
      tmp.onLoad = tmp.togglePlay;
      tmp.loadSource(fullPath);
    } else {
      this.audioProcessors[filename].togglePlay();
    }
  }
}

export default Page;
