// @flow
import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CssBaseline from '@material-ui/core/CssBaseline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import styles from './App.less';

type Props = {
  children: React.Node,
  history: object
};

const lists = [
  {
    text: '音乐剪切',
    url: '/'
  },
  {
    text: '音乐录制',
    url: '/record'
  },
  {
    text: '我的特效',
    url: '/soundEffect'
  },
  {
    text: '设备管理',
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
          <List component='nav'>
            {
              lists.map(list => (
                <ListItem
                  key={list.url}
                  button
                  classes={{
                    root: pathname === list.url ? styles.at : ''
                  }}
                  onClick={goTo(list.url)}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faCoffee} />
                  </ListItemIcon>
                  <ListItemText primary={list.text} />
                </ListItem>
              ))
            }
          </List>
        </Drawer>
        <div className={styles.appContentContainer}>
          <Card
            classes={{
              root: styles.appContent
            }}
          >
            <CardContent>
              {this.props.children}
            </CardContent>
          </Card>
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
