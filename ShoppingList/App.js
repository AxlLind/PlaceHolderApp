import React from 'react';
import { StyleSheet, View, Button } from 'react-native';

export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            buttonTitle: 'Axel',
        };
    }

    render() {
        return (
        <View style={styles.container}>
            <Button style={styles.text} onPress={() => this.buttonPress()} title={this.state.buttonTitle}/>
        </View>
        );
    }

    buttonPress() {
        const text = this.state.buttonTitle === 'Axel' ? 'Elli' : 'Axel';
        this.setState({
            buttonTitle: text,
        });
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
