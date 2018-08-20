// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import fileManager from 'service/fileManager';
import { connect } from 'react-redux';

type Props = {};

class Page extends React.Component {
  props: Props;

  render() {
    const tf = fileManager.getTFCard();
    
    if (!tf) {
      return (
        <div>没有声卡设备，请插入后重启软件</div>
      );
    }
    
    return (
      <div>
        {
          fileManager.readMusicFromTFCard().map(
            mp3 => (
              <div key={mp3}>
                <div>{mp3}</div>
                <Button
                  onClick={
                    () => fileManager.deleteFromTFCard(mp3) || this.forceUpdate()
                  }
                >
                  删除
                </Button>
              </div>
            )
          )
        }
      </div>
    );
  }
}

export default Page;
