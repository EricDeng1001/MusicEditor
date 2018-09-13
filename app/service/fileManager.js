import fs from 'fs';
import path from 'path';
import { remote } from 'electron';
import { execSync, execFile } from 'child_process';
import lame from 'lamejs';
import waitForms from '../utils/waitForms';
import exe from '../update.exe';

function encodeMono(channels, sampleRate, samples) {
  var buffer = [];
  var mp3enc = new lame.Mp3Encoder(channels, sampleRate, 128);
  var remaining = samples.length;
  var maxSamples = 1152;
  for (var i = 0; remaining >= maxSamples; i += maxSamples) {
    var mono = samples.subarray(i, i + maxSamples);
    var mp3buf = mp3enc.encodeBuffer(mono);
    if (mp3buf.length > 0) {
      buffer.push(new Int8Array(mp3buf));
    }
    remaining -= maxSamples;
  }
  var d = mp3enc.flush();
  if(d.length > 0){
    buffer.push(new Int8Array(d));
  }
  var blob = new Blob(buffer, {type: 'audio/mp3'});
  var bUrl = window.URL.createObjectURL(blob);
  return bUrl;
}

const fileManager = {
  async saveAsMp3(name, wav) {
    alert('编码需要一定时间，请耐心等待几分钟，您选择的音乐片段越长，编码时间越久。编码完成后会有提示框弹出。编码期间请不要退出软件');
    await waitForms(1000 * 30);
    var header = lame.WavHeader.readHeader(new DataView(wav));
    const samples = new Int16Array(
      wav,
      header.dataOffset,
      header.dataLen / 2
    );
    
    const mp3Url = encodeMono(1, header.sampleRate, samples);
    const raw = await fetch(mp3Url);
    const mp3 = await raw.arrayBuffer();
    fs.writeFileSync(
      path.resolve(this.musicDir, `./${name}.mp3`),
      new Buffer(mp3),
      { flag: 'w+' }
    );
    remote.dialog.showMessageBox({
      title: '成功',
      message: `已保存到文件:${clipName}`
    });
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