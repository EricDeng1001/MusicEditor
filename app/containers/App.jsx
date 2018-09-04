// @flow
import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CssBaseline from '@material-ui/core/CssBaseline';
import btn1_1 from 'images/btn1-1.png';
import btn1_2 from 'images/btn1-2.png';
import btn2_1 from 'images/btn2-1.png';
import btn2_2 from 'images/btn2-2.png';
import btn3_1 from 'images/btn3-1.png';
import btn3_2 from 'images/btn3-2.png';
import btn4_1 from 'images/btn4-1.png';
import btn4_2 from 'images/btn4-2.png';
import logo from 'images/logo.png';
import styles from './App.less';

type Props = {
  children: React.Node,
  history: object
};

const lists = [
  {
    name: '音乐剪切',
    at: btn1_2,
    notAt: btn1_1,
    url: '/'
  },
  {
    name: '音乐录制',
    at: btn2_2,
    notAt: btn2_1,
    url: '/record'
  },
  {
    name: '我的特效',
    at: btn3_2,
    notAt: btn3_1,
    url: '/soundEffect'
  },
  {
    name: '设备管理',
    at: btn4_2,
    notAt: btn4_1,
    url: '/equipment'
  }
];

class App extends React.Component<Props> {
  props: Props;

  render() {
    const {
      goTo,
      props: {
        history: {
          location: {
            pathname
          }
        }
      }
    } = this;

    return (
      <div className={styles.root}>
        <CssBaseline />
        <Drawer
          variant='permanent'
          classes={{
            docked: styles.navigator,
            paper: styles.navigator
          }}
        >
          <img
            width="250px"
            height="178px"
            src={logo}
            alt="logo"
          />
          <List component='nav'>
            {
              lists.map(list => (
                <img
                  key={list.url}
                  onClick={goTo(list.url)}
                  src={pathname === list.url ? list.at : list.notAt}
                  width="250px"
                  height="66px"
                  className={styles.item}
                />
              ))
            }
          </List>
        </Drawer>
        <div className={styles.appContentContainer}>
          {this.props.children}
        </div>
      </div>
    );
  }

  goTo = url => ev => {
    const {
      props: {
        history
      }
    } = this;

    if (history.location.pathname === url) {
      return;
    }

    history.push(url);
  }

}

export default App;
