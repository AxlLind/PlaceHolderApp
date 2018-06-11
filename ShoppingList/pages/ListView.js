import React from 'react';
import { StyleSheet, ScrollView, AsyncStorage, Text } from 'react-native';
import _ from 'lodash';
import config from './config.js';
import backend from './backend.js';

export default class ListViewerPage extends React.Component {
    static navigationOptions = {
        title: 'Sign Up',
        headerStyle: {
            backgroundColor: '#aaccff',
        },
        headerTitleStyle: {
            color: '#222233',
        }
    };

    constructor() {
        super();
        this.state = {
            lists: [],
            gotLists: false,
        };
    }

    componentDidMount() {
        AsyncStorage.getItem('email')
            .then(email => this.setState({ email }))
            .then(() => AsyncStorage.getItem('token'))
            .then(token => {this.setState({ token }); console.log(token)})
            .then(() => backend.getLists({
                email: this.state.email,
                token: this.state.token,
            }))
            .then(res => {
                if (res.flag === false)
                    return Promise.reject(res.message);
                return res.data.lists;
            })
            .then(lists => this.setState({ lists, gotLists: true }))
            .catch(console.log);
    }

    render() {
        return (
        <ScrollView style={styles.container}>
            {_.map(this.state.lists, list => <Text style={styles.text} key={list.list_id}>{`${list.list_id}: ${list.list_name}`}</Text>)}
        </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222233',
  },
  text: {
    color: '#aaccff',
  }
});
