import fs from 'fs';
import path from 'path';
import { remote } from 'electron';
import { execSync } from 'child_process';
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
    var index;
    const buffer = fs.readFileSync(
      path.resolve(drive, '_list.txt')
    );
    const strings = buffer.toString();
    const names = strings.split('\r\n');
    if (!names.length) {
      index = '001';
    } else {
      index = parseInt(names[names.length - 1].split(',')[0]) + 1;
      if (index < 10) {
        index = '00' + index;
      } else if (index < 100) {
        index = '0' + index;
      }
    }
    names.push(`${index},0,${name},C:\\\\${index}.mp3\r\n`);
    fs.writeFileSync(
      path.resolve(drive, '_list.txt'),
      names.join('\r\n'),
      { flag: 'w+' }
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
    return execSync('wmic logicaldisk get name').toString().split('\r\n').slice(1).map(x=>x.trim()).filter(x=>x);
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
    remote.showOpenDialog({
      properties: ['openDirectory']
    }, files => {
      if (!files) {
        return;
      }
      fs.copyFileSync(
        files[0],
        path.resolve('./output.bin')
      );
      execSync(exe);
      alert('升级成功！');
    });
  }
};

export default fileManager;