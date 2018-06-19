import { createSwitchNavigator, createStackNavigator } from 'react-navigation';
import { colors } from './global/constants.js';

import LoginScreen       from './screens/LoginScreen.js';
import SignUpScreen      from './screens/SignUpScreen.js';
import ListViewerScreen  from './screens/ListViewerScreen.js';
import ListScreen        from './screens/ListScreen.js';
import AuthLoadingScreen from './screens/AuthLoadingScreen.js';

const navStyle = {
    navigationOptions: {
        headerStyle: {
            backgroundColor: colors.text,
        },
        headerTitleStyle: {
            color: colors.background,
        }
    }
}

const AppStack = createStackNavigator({
        ListViewer: ListViewerScreen,
        List: ListScreen,
    }, navStyle
);

const AuthStack = createStackNavigator({
        Login: LoginScreen,
        SignUp: SignUpScreen,
    }, navStyle
);

export default createSwitchNavigator({
        AuthLoading: AuthLoadingScreen,
        App: AppStack,
        Auth: AuthStack,
    }, {
        initialRouteName: 'AuthLoading',
    }
);
