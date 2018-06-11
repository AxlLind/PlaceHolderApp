import React from 'react';
import { StyleSheet, View, TextInput, Text, Button, AsyncStorage } from 'react-native';
import _ from 'lodash';
import config from './../global/config.js';
import backend from './../global/backend.js';
import sha256 from 'sha256';

export default class LoginPage extends React.Component {
    static navigationOptions = {
        title: 'Login',
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
            text: '',
            email: 'test@test.com',
            pw: '123456789',
        };
    }

    componentDidMount() {
        AsyncStorage.multiGet(['email', 'token'])
            .then(keyPairs => this.setState(_.fromPairs(keyPairs)))
            .then(() => backend.testSessionToken(this.state.email, this.state.token))
            .then(res => {
                if (res.flag === false)
                    return Promise.reject(res.message);
            })
            .then(() => this.props.navigation.navigate('ListViewer'))
            .catch(console.log);
    }

    render() {
        return (
        <View style={styles.container}>
            <Text style={styles.text}>{this.state.text}</Text>
            <TextInput style={styles.text}
                value={this.state.email}
                onSubmitEditing={() => this.login()}
                onChangeText={email => this.setState({email})}
            />
            <TextInput style={styles.text}
                value={this.state.pw}
                onSubmitEditing={() => this.login()}
                onChangeText={pw => this.setState({pw})}
            />
            <Button title='Submit' onPress={() => this.login()}/>
            <Button title='Sign Up' onPress={() => this.props.navigation.navigate('SignUp')}/>
        </View>
        );
    }

    login() {
        backend.requestSessionToken(this.state.email, this.state.pw)
            .then(res => {
                if (res.flag === false) {
                    setTimeout(() => this.setState({ text: '' }), 1000);
                    return this.setState({ text: res.message });
                }
                return res.data.token;
            })
            .then(token => AsyncStorage.multiSet(_.toPairs({
                email: this.state.email,
                token,
            })))
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
