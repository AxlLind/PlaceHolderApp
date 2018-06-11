import React from 'react';
import { StyleSheet, ScrollView, AsyncStorage, Text, View, TextInput, Button } from 'react-native';
import _ from 'lodash';
import Modal from 'react-native-modal';
import config from './../global/config.js';
import backend from './../global/backend.js';

export default class ListPage extends React.Component {
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
            items: [],
            gotLists: false,
            showAddItem: false,
            addItemName: '',
            addItemErrorText: '',
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
            .then(() => this.populateItems());
    }

    addItem() {
        backend.addItemToList(this.state.email, this.state.token, this.state.list_id, this.state.addItemName)
            .then(res => {
                if (res.flag === false) {
                    this.setState({addItemErrorText: res.message})
                    setTimeout(() => this.setState({addItemErrorText: ''}), 2000);
                    return Promise.reject(res.message);
                }
            })
            .then(() => this.setState({showAddItem: false}))
            .then(() => this.populateItems());
    }

    render() {
        return (
        <ScrollView style={styles.container}>
            {_.map(this.state.items, item => <Text style={styles.text} key={item}>{item}</Text>)}
            <Modal isVisible={this.state.showAddItem}>
                <View style={styles.modal}>
                    <Text style={styles.text}>{this.state.addItemErrorText}</Text>
                    <TextInput
                        value={this.state.addItemName}
                        onSubmitEditing={() => this.addItem()}
                        onChangeText={addItemName => this.setState({addItemName})}
                    />
                </View>
            </Modal>
            <Button title='Submit' onPress={() => this.setState({showAddItem: true})}/>
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
