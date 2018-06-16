import React from 'react';
import { ScrollView, AsyncStorage, Text, View, TextInput } from 'react-native';
import _ from 'lodash';
import Modal from 'react-native-modal';
import { primaryButton, secondaryButton, handleResponse } from './../global/shared.js';
import styles from './../styles.js';
import backend from './../global/backend.js';

export default class ListScreen extends React.Component {
    static navigationOptions = nav => ({ title: nav.navigation.getParam('list_name')});

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
        const {email, token, list_id} = this.state;
        return backend.getListItems(email, token, list_id)
            .then(res => handleResponse(this, res, _.get(res, 'data.items')))
            .then(items => this.setState({ items, gotItems: true }))
            .catch(console.log);
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
        const { email, token, list_id, addItemName } = this.state;
        backend.addItemToList(email, token, list_id, addItemName)
            .then(res => handleResponse(this, res))
            .then(() => this.setState({
                showAddItem: false,
                addItemName: '',
            }))
            .then(() => this.populateItems())
            .catch(() => {
                this.setState({addItemErrorText: res.message})
                setTimeout(() => this.setState({
                    addItemErrorText: '',
                    showAddItem: false,
                    addItemName: ''})
                , 2000);
            });
    }

    deleteItem() {
        const {email, token, list_id, deleteItem} = this.state;
        backend.deleteItemFromList(email, token, list_id, deleteItem)
            .then(res => handleResponse(this, res))
            .then(this.setState({
                showDeleteItem: false,
                deleteItem: '',
            }))
            .then(() => this.populateItems())
            .catch(console.log);
    }

    renderAddPopup = () => (
        <Modal isVisible={this.state.showAddItem}>
            <View style={styles.popupContainer}>
                <View style={styles.popup}>
                    <Text style={styles.text}>{'Add an item'}</Text>
                    <TextInput style={styles.text}
                        value={this.state.addItemName}
                        onSubmitEditing={() => this.addItem()}
                        onChangeText={addItemName => this.setState({addItemName})}
                    />
                    {primaryButton('Yes', () => this.addItem())}
                    {secondaryButton('No', () => this.setState({showAddItem: false}))}
                </View>
            </View>
        </Modal>
    );

    renderDeletePopup = () => (
        <Modal isVisible={this.state.showDeleteItem}>
            <View style={styles.popupContainer}>
                <View style={styles.popup}>
                    <Text style={styles.text}>{`Delete '${this.state.deleteItem}'?`}</Text>
                    {primaryButton('Yes', () => this.deleteItem())}
                    {secondaryButton('No', () => this.setState({showDeleteItem: false}))}
                </View>
            </View>
        </Modal>
    );

    render = () => (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
                {this.state.items.length === 0 ? <Text style={styles.text}>{'No items in this list yet!'}</Text> :
                    _.map(this.state.items, item =>
                    <Text style={styles.text}
                        onPress={() => this.setState({deleteItem: item, showDeleteItem: true})}
                        key={item}>
                            {item}
                    </Text>
                )}
            </ScrollView>
            <View style={{padding: 20}}>
                {this.renderAddPopup()}
                {this.renderDeletePopup()}
                {primaryButton('Add Item', () => this.setState({showAddItem: true}))}
            </View>
        </View>
    );
}
