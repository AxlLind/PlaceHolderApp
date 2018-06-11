import React from 'react';
import { StyleSheet, View, TextInput, Text, Button } from 'react-native';
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
            test: 'Sign Up',
            email: 'Email',
            pw: 'Password',
        };
    }

    render() {
        return (
        <View style={styles.container}>
            <Text style={styles.text}>{this.state.test}</Text>
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
        backend.registerUser(this.state.email, sha256(this.state.pw))
            .then(res => this.setState({test: res.flag === false ? 'Nope' : 'Validated'}))
            .then(() => this.props.navigation.goBack())
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
