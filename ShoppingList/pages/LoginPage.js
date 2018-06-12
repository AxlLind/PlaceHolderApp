import React from 'react';
import { StyleSheet, View, TextInput, Text, Button, AsyncStorage } from 'react-native';
import _ from 'lodash';
import { config, codes } from './../global/config.js';
import backend from './../global/backend.js';
import sha256 from 'sha256';

export default class LoginPage extends React.Component {
    static navigationOptions = { title: 'Login' };

    constructor() {
        super();
        this.state = {
            text: '',
            email: 'test@test.com',
            pw: '123456789',
        };
    }

    componentDidMount() {
        AsyncStorage.getItem('email')
            .then(email => this.setState({email}))
            .catch(console.log);
    }

    login() {
        const {email, pw} = this.state;
        backend.requestSessionToken(email, sha256(pw))
            .then(res => {
                if (res.code !== codes.success) {
                    setTimeout(() => this.setState({ text: '' }), 1000);
                    return this.setState({ text: res.message });
                }
                return res.data.token;
            })
            .then(token => AsyncStorage.multiSet(_.toPairs({
                email: email,
                token,
            })))
            .then(() => this.props.navigation.navigate('ListViewer'))
            .catch(console.log);
    }

    render = () => (
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
