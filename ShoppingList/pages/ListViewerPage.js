import React from 'react';
import { StyleSheet, ScrollView, AsyncStorage, Text, View, TextInput, Button } from 'react-native';
import Modal from 'react-native-modal';
import _ from 'lodash';
import {config, codes} from './../global/config.js';
import backend from './../global/backend.js';

export default class ListViewerPage extends React.Component {
    static navigationOptions = { title: 'Your Lists' };

    constructor() {
        super();
        this.state = {
            lists: [],
            gotLists: false,
            showAddList: false,
            addList: '',
            deleteList: {
                list_id: -1,
                list_name: '',
            }
        };
    }

    populateLists() {
        return backend.getLists(this.state.email, this.state.token)
            .then(res => {
                if (res.code !== codes.success)
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

    logout() {
        AsyncStorage.removeItem('token')
            .then(() => this.props.navigation.navigate('Auth'));
    }

    addList() {
        const {email, token, addList} = this.state;
        backend.createList(email, token, addList)
            .then(res => {
                if (res.code !== codes.success)
                    return Promise.reject(res.message);
            })
            .then(() => this.populateLists())
            .then(() => this.setState({
                showAddList: false,
                addList: '',
            }))
            .catch(console.log);
    }

    deleteList() {
        const {email, token, deleteList} = this.state
        backend.deleteList(email, token, deleteList.list_id)
            .then(res => {
                if (res.code != codes.success)
                    return Promise.reject(res.message);
            })
            .then(() => this.populateLists())
            .then(() => this.setState({ showDeleteList: false }))
            .catch(console.log);
    }

    switchToList(list_id, list_name) {
        this.props.navigation.navigate('List', { list_id, list_name });
    }

    renderAddListPopup = () => (
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
    );

    renderDeleteListPopup = () => (
        <Modal isVisible={this.state.showDeleteList}>
            <View style={styles.container}>
                <Text style={styles.text}>
                    {`Are you sure you want to delete '${this.state.deleteList.list_name}'?`}
                </Text>
                <Button title='Confirm' onPress={() => this.deleteList()}/>
                <Button title='Cancel' onPress={() => this.setState({showDeleteList: false})}/>
            </View>
        </Modal>
    );

    render = () => (
        <ScrollView style={styles.container}>
            {_.map(this.state.lists, list =>
                <Text style={styles.text}
                    key={list.list_id}
                    onPress={() => this.switchToList(list.list_id, list.list_name)}
                    onLongPress={() => this.setState({showDeleteList: true, deleteList: list})}
                >
                {`${list.list_name}`}
                </Text>
            )}
            {this.renderAddListPopup()}
            {this.renderDeleteListPopup()}
            <Button title='Create new list' onPress={() => this.setState({showAddList: true})}/>
            <Button title='Logout' onPress={() => this.logout()}/>
        </ScrollView>
    );
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
