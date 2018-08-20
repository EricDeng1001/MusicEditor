// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

type Props = {};

class GetClipNameDialog extends React.Component<Props> {
  props: Props;
  state = {
    open: false,
    clipName: ''
  }

  render() {
    const {
      close,
      handleAction,
      handleInput,
      state: {
        open
      }
    } = this;

    return (
      <Dialog
        open={open}
        onClose={close}
      >
        <DialogTitle>输入片段名称</DialogTitle>
        <DialogContent>
          <DialogContentText>
            输入您要剪切的片段名称，这个片段将会储存到您在“我的特效”中指定的目录。
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            label='名称'
            fullWidth
            onChange={handleInput}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAction} color='primary'>
            确定
          </Button>
          <Button onClick={close} color='secondary'>
            取消
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  close = () => {
    this.setState({
      open: false
    });
  }

  open = () => {
    this.setState({
      open: true
    });
  }

  handleInput = ev => {
    this.clipName = ev.target.value;
  }

  handleAction = ev => {
    const {
      clipName,
      close,
      props: {
        action
      }
    } = this;
    action(clipName);
    close();
  }
}

export default GetClipNameDialog;
