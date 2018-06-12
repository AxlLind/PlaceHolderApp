import React from 'react';
import { createSwitchNavigator, createStackNavigator } from 'react-navigation';
import LoginPage from './pages/LoginPage.js';
import SignUpPage from './pages/SignUpPage.js';
import ListViewerPage from './pages/ListViewerPage.js';
import ListPage from './pages/ListPage.js';
import AuthLoadingPage from './pages/AuthLoadingPage.js';

const AppStack = createStackNavigator({
    ListViewer: ListViewerPage,
    List: ListPage,
});

const AuthStack = createStackNavigator({
    Login: LoginPage,
    SignUp: SignUpPage,
})

export default createSwitchNavigator({
        AuthLoading: AuthLoadingPage,
        App: AppStack,
        Auth: AuthStack,
    }, {
        initialRouteName: 'AuthLoading',
        headerStyle: {
            backgroundColor: '#aaccff',
        },
        headerTitleStyle: {
            color: '#222233',
        }
    }
);
