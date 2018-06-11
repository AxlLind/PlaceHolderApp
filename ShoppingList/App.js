import React from 'react';
import { createStackNavigator } from 'react-navigation';
import LoginPage from './pages/LoginPage.js';
import SignUpPage from './pages/SignUpPage.js';
import ListViewerPage from './pages/ListViewerPage.js';
import ListPage from './pages/ListPage.js';

export default createStackNavigator({
    Home: LoginPage,
    SignUp: SignUpPage,
    ListViewer: ListViewerPage,
    List: ListPage,
});
