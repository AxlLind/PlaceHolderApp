import React from 'react';
import { View, AsyncStorage, ActivityIndicator } from 'react-native';
import _ from 'lodash';
import { colors } from './../global/constants.js';
import { codes } from './../global/config.js';
import backend from './../global/backend.js';
import styles from './../styles.js';

export default class AuthLoadingScreen extends React.Component {
    static navigationOptions = { headerMode: 'none' };

    componentDidMount() {
        AsyncStorage.multiGet(['email', 'token'])
            .then(keyPairs => _.fromPairs(keyPairs))
            .then(({email, token}) => backend.testSessionToken(email, token))
            .then(res => {
                if (!_.isEqual(res.code, codes.success))
                    return Promise.reject();
            })
            .then(() => this.props.navigation.navigate('App'))
            .catch(() => this.props.navigation.navigate('Auth'));
    }

    render = () => (
        <View style={styles.container}>
            <ActivityIndicator size='large' color={colors.text} />
        </View>
    );
}
