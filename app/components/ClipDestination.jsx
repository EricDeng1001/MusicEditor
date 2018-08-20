// @flow
import * as React from 'react';
import { remote } from 'electron';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
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
        <FontAwesomeIcon icon={faFolder} size='lg' />
        <Typography>存储路径:</Typography>
        <section>
          <TextField
            fullWidth
            disabled
            value={fileManager.musicDir}
          />
        </section>
        <Button
          color='primary'
          variant='contained'
          onClick={handleClick}
        >
          更改
        </Button>
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
