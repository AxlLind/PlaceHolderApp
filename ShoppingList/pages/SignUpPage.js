import React from 'react';
import { StyleSheet, View, TextInput, Text, Button, AsyncStorage } from 'react-native';
import _ from 'lodash'
import config from './../global/config.js';
import backend from './../global/backend.js';
import sha256 from 'sha256';

export default class SignUpPage extends React.Component {
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
            email: 'Email',
            pw: 'Password',
        };
    }

    render() {
        return (
        <View style={styles.container}>
            <TextInput
                style={styles.text}
                value={this.state.email}
                onSubmitEditing={() => this.signUp()}
                onChangeText={email => this.setState({email})}/>
            <TextInput
                style={styles.text}
                value={this.state.pw}
                onSubmitEditing={() => this.signUp()}
                onChangeText={pw => this.setState({pw})}/>
            <Button title='Submit' onPress={() => this.signUp()}/>
        </View>
        );
    }

    signUp() {
        const pw_hash = sha256(this.state.pw), email = this.state.email;
        backend.registerUser(email, pw_hash)
            .then(res => {
                if (res.flag === false)
                    return Promise.reject(res.message);
            })
            .then(() => backend.requestSessionToken(email, pw_hash))
            .then(res => {
                if (res.flag === false)
                    return Promise.reject(res.message);
                return res.data.token;
            })
            .then(token => AsyncStorage.multiSet(_.toPairs({email, token})))
            .then(() => this.props.navigation.navigate('ListViewer'))
            .catch(console.log);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222233',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#aaccff',
    }
});
