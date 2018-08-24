import React from 'react';
import os from 'os';
import { remote } from 'electron';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import fileManager from 'service/fileManager';
import AudioProcessor from 'service/AudioProcessor';
// import greetings from './greetings.mp3';
import './app.global.less';

const homedir = os.homedir();
const MyMusicDir = `${homedir}\\Music`;

const store = configureStore({});

fileManager.musicDir = localStorage.clipDestination || MyMusicDir;
render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}

window.alert = msg => remote.dialog.showMessageBox({
  title: '唱吧编辑器',
  message: msg.toString()
});

window.audioCtx = new AudioContext();
//setTimeout(() => {
//  window.background = new AudioProcessor(audioCtx);
//  window.background.onLoad = window.background.togglePlay;
//  window.background.loadSource(greetings);
//}, 10 * 1000);