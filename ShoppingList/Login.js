import React from 'react';
import { StyleSheet, View, TextInput, Text, Button, AsyncStorage } from 'react-native';
import config from './config.js';
import backend from './backend.js';
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

    render() {
        return (
        <View style={styles.container}>
            <Text style={styles.text}>{this.state.text}</Text>
            <TextInput style={styles.text} value={this.state.email} onSubmitEditing={() => this.login()} onChangeText={email => this.setState({email})}/>
            <TextInput style={styles.text} value={this.state.pw} onSubmitEditing={() => this.login()} onChangeText={pw => this.setState({pw})}/>
            <Button title='Submit' onPress={() => this.login()}/>
            <Button title='Sign Up' onPress={() => this.props.navigation.navigate('SignUp')}/>
        </View>
        );
    }

    login() {
        backend.requestSessionToken({
            email: this.state.email,
            pw_hash: this.state.pw,
        })
        .then(res => {
            if (res.flag === false)
                return this.setState({ text: res.message });
            AsyncStorage.multiSet([['token', res.data.token],['email', this.state.email]])
                .then(() => this.props.navigation.navigate('ListViewer'))
        })
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
