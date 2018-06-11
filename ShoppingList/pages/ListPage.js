import React from 'react';
import { StyleSheet, ScrollView, AsyncStorage, Text, View, TextInput, Button } from 'react-native';
import _ from 'lodash';
import Modal from 'react-native-modal';
import config from './../global/config.js';
import backend from './../global/backend.js';

export default class ListPage extends React.Component {
    static navigationOptions = nav => { return {
        title: nav.navigation.getParam('list_name'),
        headerStyle: {
            backgroundColor: '#aaccff',
        },
        headerTitleStyle: {
            color: '#222233',
        }
    }};

    constructor() {
        super();
        this.state = {
            items: [],
            gotLists: false,
            showAddItem: false,
            addItemName: '',
            addItemErrorText: '',
            showDeleteItem: false,
            deleteItem: '',
        };
    }

    populateItems() {
        return backend.getListItems(this.state.email, this.state.token, this.state.list_id)
            .then(res => {
                if (res.flag === false)
                    return Promise.reject(res.message);
                return res.data.items;
            })
            .then(items => this.setState({ items, gotItems: true }))
    }

    componentDidMount() {
        const list_id = this.props.navigation.getParam('list_id', -1);
        this.setState({ list_id });
        AsyncStorage.multiGet(['email', 'token'])
            .then(keyPairs => this.setState(_.fromPairs(keyPairs)))
            .then(() => this.populateItems())
            .catch(console.log);
    }

    addItem() {
        backend.addItemToList(this.state.email, this.state.token, this.state.list_id, this.state.addItemName)
            .then(res => {
                if (res.flag === false) {
                    this.setState({addItemErrorText: res.message})
                    setTimeout(() => this.setState({
                        addItemErrorText: '',
                        showAddItem: false,
                        addItemName: ''})
                    , 2000);
                    return Promise.reject(res.message);
                }
            })
            .then(() => this.setState({
                showAddItem: false,
                addItemName: '',
            }))
            .then(() => this.populateItems())
            .catch(console.log);
    }

    deleteItem() {
        const s = this.state;
        backend.deleteItemFromList(s.email, s.token, s.list_id, s.deleteItem)
            .then(res => {
                // TODO: this could only fail if our token expired
                if (res.flag === false) {
                    return Promise.reject(res.message);
                }
            })
            .then(this.setState({
                showDeleteItem: false,
                deleteItem: '',
            }))
            .then(() => this.populateItems())
            .catch(console.log);
    }

    renderAddPopup() {
        return (
        <Modal isVisible={this.state.showAddItem}>
            <View style={styles.container}>
                <Text style={styles.text}>{this.state.addItemErrorText}</Text>
                <TextInput style={styles.text}
                    value={this.state.addItemName}
                    onSubmitEditing={() => this.addItem()}
                    onChangeText={addItemName => this.setState({addItemName})}
                />
            </View>
        </Modal>
        );
    }

    renderDeletePopup() {
        return (
        <Modal isVisible={this.state.showDeleteItem}>
            <View style={styles.container}>
                <Text style={styles.text}>{`Are you sure you want to delete '${this.state.deleteItem}'?`}</Text>
                <Button title='Confirm' onPress={() => this.deleteItem()}/>
                <Button title='Cancel' onPress={() => this.setState({showDeleteItem: false})}/>
            </View>
        </Modal>
        );
    }

    render() {
        return (
        <ScrollView style={styles.container}>
            {this.state.items.length === 0 ? <Text style={styles.text}>{'No items in this list yet!'}</Text> :
                _.map(this.state.items, item =>
                <Text style={styles.text}
                    onPress={() => this.setState({deleteItem: item, showDeleteItem: true})}
                    key={item}>
                        {item}
                </Text>
            )}
            {this.renderAddPopup()}
            {this.renderDeletePopup()}
            <Button title='Add Item' onPress={() => this.setState({showAddItem: true})}/>
        </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222233',
    },
    modal: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    text: {
        color: '#aaccff',
    },
});
