import { StyleSheet } from 'react-native';
import { colors } from './global/constants.js'

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    text: {
        color: colors.text,
        padding: 5,
        fontSize: 20,
    },
    textInput: {
        color: colors.text,
        fontSize: 20,
        width: 200,
        padding: 10,
    },
    button: {
        backgroundColor: colors.text,
        padding: 5,
        borderRadius: 4,
    },
    popupContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    popup: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        width: 200,
        height: 130,
        padding: 10,
        backgroundColor: colors.background,
    }
});
