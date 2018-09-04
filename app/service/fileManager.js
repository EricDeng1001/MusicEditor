import fs from 'fs';
import path from 'path';
import { remote } from 'electron';
import { execSync, execFile } from 'child_process';
import exe from '../update.exe';
const fileManager = {
  saveAsMp3(name, wav) {
    fs.writeFileSync(
      path.resolve(this.musicDir, `./${name}.mp3`),
      new Buffer(wav),
      { flag: 'w+' }
    );
  },
  
  readMusicFromMusicDir() {
    return fs.readdirSync(this.musicDir).filter(file =>
      file.slice(file.lastIndexOf('.'), file.length) === '.mp3'
    ).map(file => file.slice(0, file.lastIndexOf('.')));
  },
  
  readMusicFromTFCard() {
    const drive = this.getTFCard();
    if (!drive) {
      throw "没有声卡设备";
    }
    return fs.readdirSync(drive).filter(file => file !== '_list.txt').filter(file =>
      file.slice(file.lastIndexOf('.'), file.length) === '.mp3'
    ).map(file => file.slice(0, file.lastIndexOf('.')));
  },
  
  deleteFromMusicDir(name) {
    fs.unlinkSync(path.resolve(this.musicDir, `./${name}.mp3`));
  },
  
  deleteFromTFCard(name) {
    const drive = this.getTFCard();
    if (!drive) {
      throw "没有声卡设备";
    }
    fs.unlinkSync(path.resolve(drive, `./${name}.mp3`));
    const names = fs.readdirSync(drive).filter(file => file !== '_list.txt').filter(file =>
      file.slice(file.lastIndexOf('.'), file.length) === '.mp3'
    ).map(file => file.slice(0, file.lastIndexOf('.')));
    fs.writeFileSync(
      path.resolve(drive, '_list.txt'),
      names.map((name, index) => `${index + 1},0,${name},C:\\${index + 1}.mp3\r\n`).join(''),
      { flag: 'w+' }
    );
  },
  
  uploadToTFCard(name) {
    const drive = this.getTFCard();
    if (!drive) {
      throw '没有声卡设备';
    }
    fs.copyFileSync(
      path.resolve(this.musicDir, `./${name}.mp3`),
      path.resolve(drive, `./${name}.mp3`)
    );
    const names = fs.readdirSync(drive).filter(file => file !== '_list.txt').filter(file =>
      file.slice(file.lastIndexOf('.'), file.length) === '.mp3'
    ).map(file => file.slice(0, file.lastIndexOf('.')));
    fs.writeFileSync(
      path.resolve(drive, '_list.txt'),
      names.map((name, index) => `${index + 1},0,${name},C:\\${index + 1}.mp3\r\n`).join(''),
      { flag: 'w+' }
    );
  },
  
  downloadFromTFCard(name) {
    const drive = this.getTFCard();
    if (!drive) {
      throw '没有声卡设备';
    }
    fs.copyFileSync(
      path.resolve(drive, `./${name}.mp3`),
      path.resolve(this.musicDir, `./${name}.mp3`)
    );
  },
  
  _isTFCard(drive) {
    for (let file of fs.readdirSync(drive)) {
      if (file === '_list.txt') {
        return true;
      }
    }
    return false;
  },
  
  _listDrives() {
    return execSync('wmic logicaldisk get name').toString().split('\r\n').slice(1).map(x=>x.trim()+'\\').filter(x=>x);
  },
  
  getTFCard() {
    for (let drive of this._listDrives()) {
      if (this._isTFCard(drive)) {
        return drive;
      }
    }
    return null;
  },
  
  updateCard() {
    remote.dialog.showOpenDialog({
      properties: ['openFile'],
      title: "选择output.bin"
    }, files => {
      if (!files) {
        return;
      }
      fs.copyFileSync(
        files[0],
        path.resolve('./output.bin')
      );
      execFile(exe, err => console.log(err));
      alert('升级成功！');
    });
  }
};

window.fileManager = fileManager;

export default fileManager;