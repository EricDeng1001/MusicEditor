// @flow
import * as React from 'react';
import RecordTrack from 'components/RecordTrack';
import { connect } from 'react-redux';

type Props = {};

class Page extends React.Component {
  props: Props;

  render() {
    return (
      <div>
        <RecordTrack />
      </div>
    );
  }
}

export default Page;
