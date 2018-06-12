import React from 'react';
import { StyleSheet, View, AsyncStorage, ActivityIndicator } from 'react-native';
import _ from 'lodash';
import { codes } from './../global/config.js';
import backend from './../global/backend.js';

export default class LoginPage extends React.Component {
    static navigationOptions = { title: 'Loading', headerMode: 'none' };

    componentDidMount() {
        AsyncStorage.multiGet(['email', 'token'])
            .then(keyPairs => _.fromPairs(keyPairs))
            .then(o => backend.testSessionToken(o.email, o.token))
            .then(res => {
                if (res.code === codes.invalidAuth)
                    return Promise.reject(res.message);
            })
            .then(() => this.props.navigation.navigate('App'))
            .catch(() => this.props.navigation.navigate('Auth'));
    }

    render = () => (
        <View style={styles.container}>
            <ActivityIndicator size='large' color='#aaccff' />
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
