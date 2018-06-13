import React from 'react';
import Button from 'react-native-button';
import { codes } from './config.js';
import { colors } from './constants.js';
import styles from './../styles.js';

const primaryButton = (title, onPress) => (
    <Button
        style={{color: colors.background}}
        containerStyle={styles.button}
        onPress={onPress}
    >
        {title}
    </Button>
);

const secondaryButton = (title, onPress) => (
    <Button
        style={{color: '#ffffff', fontSize: 14}}
        onPress={onPress}
    >
        {title}
    </Button>
);

const handleResponse = (screen, res, val) => {
    switch (res.code) {
    case codes.success:
        return val;
    case codes.invalidAuth:
        screen.props.navigation.navigate('Auth');
    default: // fallthrough
        return Promise.reject(res.message);
    }
};

export {
    primaryButton,
    secondaryButton,
    handleResponse
}
