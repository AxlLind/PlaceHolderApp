import React from 'react';
import { StyleSheet, View, TextInput, Text, Button, AsyncStorage } from 'react-native';
import _ from 'lodash'
import sha256 from 'sha256';
import {config, codes} from './../global/config.js';
import backend from './../global/backend.js';

export default class SignUpPage extends React.Component {
    static navigationOptions = { title: 'Sign Up' };

    constructor() {
        super();
        this.state = {
            email: 'Email',
            pw: 'Password',
        };
    }

    signUp() {
        const pw_hash = sha256(this.state.pw), {email} = this.state;
        backend.registerUser(email, pw_hash)
            .then(res => {
                if (res.code !== codes.success)
                    return Promise.reject(res.message);
            })
            .then(() => backend.requestSessionToken(email, pw_hash))
            .then(res => {
                if (res.code !== codes.success)
                    return Promise.reject(res.message);
                return res.data.token;
            })
            .then(token => AsyncStorage.multiSet(_.toPairs({email, token})))
            .then(() => this.props.navigation.navigate('App'))
            .catch(console.log);
    }

    render = () => (
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
