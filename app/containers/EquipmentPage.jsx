// @flow
import * as React from 'react';
import path from 'path';
import fileManager from 'service/fileManager';
import Button from '@material-ui/core/Button';
import ClipDestination from 'components/ClipDestination';
import File from 'components/File';
import selectAll from 'images/selectAll.png';
import notSelectAll from 'images/notSelectAll.png';
import downloadSelect from 'images/downloadSelect.png';
import update from 'images/update.png';
import noTF from 'images/noTF.jpg';

type Props = {};

class Page extends React.Component {
  props: Props;
  state = {
    all: false,
    selected: {}
  }
  render() {
    
    const tf = fileManager.getTFCard();
    
    if (!tf) {
      return (
        <div style={{ width: '100%', padding: '66px 66px 66px 66px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            position: 'fixed',
            top: '64px',
            left: '316px'
          }}>
            <img
              src={update}
            />
          </div>
          <img
            src={noTF}
          />
        </div>
      );
    }
    
    return (
      <div style={{ width: '100%', padding: '66px 66px 66px 66px'}}>
        <div style={{
          position: 'fixed',
          top: '64px',
          left: '316px'
        }}>
          <img
            className='button'
            src={update}
            onClick={() => fileManager.updateCard()}
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
            fileManager.readMusicFromTFCard().map(
              mp3 => (
                <File isLocal={false}
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
            src={downloadSelect}
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
    fileManager.readMusicFromTFCard().forEach(
      mp3 => this.setState(prev => ({...prev, selected: {...prev.selected, [mp3]: prev.all }}))
    ));
  }
  
  uploadSelect = () => {
    for (let [k,v] of this.state.selected) {
      if (v) {
        fileManager.downloadFromTFCard(k);
      }
    }
  }
}

export default Page;
