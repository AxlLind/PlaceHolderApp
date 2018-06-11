import React from 'react';
import { StyleSheet, ScrollView, AsyncStorage, Text, View, TextInput, Button } from 'react-native';
import Modal from 'react-native-modal';
import _ from 'lodash';
import config from './../global/config.js';
import backend from './../global/backend.js';

export default class ListViewerPage extends React.Component {
    static navigationOptions = {
        title: 'Your Lists',
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
            showAddList: false,
            addList: '',
        };
    }

    populateLists() {
        return backend.getLists(this.state.email, this.state.token)
            .then(res => {
                if (res.flag === false)
                    return Promise.reject(res.message);
                return res.data.lists;
            })
            .then(lists => this.setState({ lists, gotLists: true }));
    }

    componentDidMount() {
        AsyncStorage.multiGet(['email', 'token'])
            .then(keyPairs => this.setState(_.fromPairs(keyPairs)))
            .then(() => this.populateLists())
            .catch(console.log);
    }

    addList() {
        backend.createList(this.state.email, this.state.token, this.state.addList)
            .then(res => {
                if (res.flag === false)
                    return Promise.reject(res.message);
            })
            .then(() => this.populateLists())
            .then(() => this.setState({
                showAddList: false,
                addList: '',
            }))
            .catch(console.log);
    }

    render() {
        return (
        <ScrollView style={styles.container}>
            {_.map(this.state.lists, list =>
                <Text style={styles.text} key={list.list_id} onPress={() => this.switchToList(list.list_id, list.list_name)}>
                {`${list.list_id}: ${list.list_name}`}
                </Text>)}
            <Modal isVisible={this.state.showAddList}>
                <View style={styles.container}>
                    <Text style={styles.text}>{'Create a new list'}</Text>
                    <TextInput style={styles.text}
                        value={this.state.addList}
                        onSubmitEditing={() => this.addList()}
                        onChangeText={addList => this.setState({addList})}
                    />
                </View>
            </Modal>
            <Button title='Create new list' onPress={() => this.setState({showAddList: true})}/>
        </ScrollView>
        );
    }

    switchToList(list_id, list_name) {
        this.props.navigation.navigate('List', { list_id, list_name });
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
