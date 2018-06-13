import React from 'react';
import { View, AsyncStorage, ActivityIndicator } from 'react-native';
import _ from 'lodash';
import { colors } from './../global/constants.js';
import backend from './../global/backend.js';
import styles from './../styles.js';
import { handleResponse } from '../global/shared.js';

export default class AuthLoadingScreen extends React.Component {
    static navigationOptions = { title: 'Loading', headerMode: 'none' };

    componentDidMount() {
        AsyncStorage.multiGet(['email', 'token'])
            .then(keyPairs => _.fromPairs(keyPairs))
            .then(({email, token}) => backend.testSessionToken(email, token))
            .then(res => handleResponse(this, res))
            .then(() => this.props.navigation.navigate('App'))
            .catch(console.log);
    }

    render = () => (
        <View style={styles.container}>
            <ActivityIndicator size='large' color={colors.text} />
        </View>
    );
}
