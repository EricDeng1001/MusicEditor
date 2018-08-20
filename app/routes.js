/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from 'containers/App';
import MusicCutPage from 'containers/MusicCutPage';
import MusicRecordPage from 'containers/MusicRecordPage';
import EquipmentPage from 'containers/EquipmentPage';
import SoundEffectPage from 'containers/SoundEffectPage';

type Props = {};

export default (props: Props) => (
  <App history={props.history}>
    <Switch>
      <Route exact path='/' component={MusicCutPage} />
      <Route exact path='/record' component={MusicRecordPage} />
      <Route exact path='/equipment' component={EquipmentPage} />
      <Route exact path='/soundEffect' component={SoundEffectPage} />
    </Switch>
  </App>
);
