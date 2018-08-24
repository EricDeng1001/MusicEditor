// @flow
import * as React from 'react';
import { remote } from 'electron';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import btnChange from 'images/btnChange.png';
import fileManager from 'service/fileManager';
import styles from './ClipDestination.less';

type Props = {};

class ClipDestination extends React.Component<Props> {
  static defaultProps = {
    onChange: () => {}
  }
  props: Props;
  render() {
    const {
      handleClick
    } = this;

    return (
      <div className={styles.root}>
        <Typography>存储路径:</Typography>
        <section>
          <TextField
            fullWidth
            disabled
            value={fileManager.musicDir}
          />
        </section>
        <img
          className='button'
          src={btnChange}
          onClick={handleClick}
        />
      </div>
    );
  }

  componentWillUnmount() {
    localStorage.clipDestination = fileManager.musicDir;
  }

  handleClick = () => {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    }, files => {
      if (!files) {
        return;
      }
      fileManager.musicDir = files[0];
      this.props.onChange();
    });
  }

}

export default ClipDestination;
