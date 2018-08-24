// @flow
import * as React from 'react';
import path from 'path';
import fileManager from 'service/fileManager';
import Button from '@material-ui/core/Button';
import ClipDestination from 'components/ClipDestination';
import File from 'components/File';
import selectAll from 'images/selectAll.png';
import notSelectAll from 'images/notSelectAll.png';
import uploadSelect from 'images/uploadSelect.png';

type Props = {};

class Page extends React.Component {
  props: Props;
  state = {
    all: false,
    selected: {}
  }
  render() {
    return (
      <div style={{ width: '100%', padding: '66px 66px 66px 66px'}}>
        <div style={{
          position: 'fixed',
          top: '64px',
          left: '316px'
        }}>
          <ClipDestination
            onChange={() => this.forceUpdate()}
          />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '25% 25% 25% 25%',
          height: '800px', overflow: 'scroll',
          marginTop: '80px',
          marginBottom: '20px'
        }}>
          {
            fileManager.readMusicFromMusicDir().map(
              mp3 => (
                <File isLocal
                  key={mp3}
                  isSelected={this.state.selected[mp3] || false}
                  filename={mp3}
                  onDelete={() => this.forceUpdate()}
                  onSelect={() => this.setState(prev => ({...prev, selected: {...prev.selected, [mp3]: !prev.selected[mp3]}}))}
                />
              )
            )
          }
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row'
        }}>
          <div>
            <img
              className='button'
              src={this.state.all ? selectAll: notSelectAll}
              onClick={this.selectAll}
            />
            <span style={{ color: 'white' }}>全选</span>
          </div>
          <img className='button'
            src={uploadSelect}
            onClick={this.uploadSelect}
          />
        </div>
      </div>
    );
  }
  
  selectAll = () => {
    this.setState(prev => ({
      all: !prev.all
    }), () =>
    fileManager.readMusicFromMusicDir().forEach(
      mp3 => this.setState(prev => ({...prev, selected: {...prev.selected, [mp3]: prev.all }}))
    ));
  }
  
  uploadSelect = () => {
    for (let [k,v] of this.state.selected) {
      if (v) {
        fileManager.uploadToTFCard(k);
      }
    }
  }
}

export default Page;
