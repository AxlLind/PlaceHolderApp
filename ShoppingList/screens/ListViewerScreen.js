import React from 'react';
import { ScrollView, AsyncStorage, Text, View, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import _ from 'lodash';
import { primaryButton, secondaryButton, handleResponse } from './../global/shared.js';
import backend from './../global/backend.js';
import styles from './../styles.js';

export default class ListViewerScreen extends React.Component {
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
            .then(res => handleResponse(this, res, _.get(res, 'data.lists')))
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
            .then(res => handleResponse(this, res))
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
            .then(res => handleResponse(this, res))
            .then(() => this.populateLists())
            .then(() => this.setState({ showDeleteList: false }))
            .catch(console.log);
    }

    switchToList(list_id, list_name) {
        this.props.navigation.navigate('List', { list_id, list_name });
    }

    renderAddListPopup = () => (
        <Modal isVisible={this.state.showAddList}>
            <View style={styles.popupContainer}>
                <View style={styles.popup}>
                    <Text style={styles.text}>{'Create a new list'}</Text>
                    <TextInput style={styles.text}
                        value={this.state.addList}
                        onSubmitEditing={() => this.addList()}
                        onChangeText={addList => this.setState({addList})}
                    />
                    {primaryButton('Confirm', () => this.addList())}
                    {secondaryButton('Cancel', () => this.setState({showAddList: false}))}
                </View>
            </View>
        </Modal>
    );

    renderDeleteListPopup = () => (
        <Modal isVisible={this.state.showDeleteList}>
            <View style={styles.popupContainer}>
                <View style={styles.popup}>
                    <Text style={styles.text}>
                        {`Delete list '${this.state.deleteList.list_name}'?`}
                    </Text>
                    {primaryButton('Yes', () => this.deleteList())}
                    {secondaryButton('No', () => this.setState({showDeleteList: false}))}
                </View>
            </View>
        </Modal>
    );

    render = () => (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{padding: 10,}}>
                {_.map(this.state.lists, list =>
                    <Text style={styles.text}
                        key={list.list_id}
                        onPress={() => this.switchToList(list.list_id, list.list_name)}
                        onLongPress={() => this.setState({showDeleteList: true, deleteList: list})}
                    >
                    {`${list.list_name}`}
                    </Text>
                )}
            </ScrollView>
            {this.renderAddListPopup()}
            {this.renderDeleteListPopup()}
            <View style={{padding: 10}}>
                {primaryButton('Create new list', () => this.setState({showAddList: true}))}
                {secondaryButton('Log Out', () => this.logout())}
            </View>
        </View>
    );
}
