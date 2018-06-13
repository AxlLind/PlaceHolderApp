import React from 'react';
import { View, TextInput, Text, AsyncStorage } from 'react-native';
import _ from 'lodash'
import sha256 from 'sha256';
import styles from './../styles.js';
import backend from './../global/backend.js';
import { primaryButton, handleResponse } from './../global/shared.js';

export default class SignUpScreen extends React.Component {
    static navigationOptions = { title: 'Sign Up' };

    constructor() {
        super();
        this.state = {
            email: '',
            pw: '',
        };
    }

    signUp() {
        const pw_hash = sha256(this.state.pw), {email} = this.state;
        backend.registerUser(email, pw_hash)
            .then(res => handleResponse(this, res))
            .then(() => backend.requestSessionToken(email, pw_hash))
            .then(res => handleResponse(this, res, res.data ? res.data.token : undefined))
            .then(token => AsyncStorage.multiSet(_.toPairs({email, token})))
            .then(() => this.props.navigation.navigate('App'))
            .catch(console.log);
    }

    render = () => (
        <View style={styles.container}>
            <TextInput style={styles.textInput}
                underlineColorAndroid='transparent'
                placeholder='Email'
                keyboardType='email-address'
                value={this.state.email}
                onSubmitEditing={() => this.login()}
                onChangeText={email => this.setState({email})}
                />
            <TextInput style={styles.textInput}
                underlineColorAndroid='transparent'
                placeholder='Password'
                secureTextEntry={true}
                value={this.state.pw}
                onSubmitEditing={() => this.login()}
                onChangeText={pw => this.setState({pw})}
            />
            {primaryButton('Submit', () => this.signUp())}
        </View>
    );
}
