// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import fileManager from 'service/fileManager';
import Button from '@material-ui/core/Button';
import ClipDestination from 'components/ClipDestination';
type Props = {};

class Page extends React.Component {
  props: Props;

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
                </div>
              )
            )
          }
        </div>
      </div>
    );
  }
}

export default Page;
