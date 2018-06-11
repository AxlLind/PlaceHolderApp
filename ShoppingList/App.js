import React from 'react';
import { createStackNavigator } from 'react-navigation';
import LoginPage from './Login.js';
import SignUpPage from './SignUpPage.js';
import ListViewerPage from './ListView.js';

export default createStackNavigator( {
    Home: LoginPage,
    SignUp: SignUpPage,
    ListViewer: ListViewerPage
});
