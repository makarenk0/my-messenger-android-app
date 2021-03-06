import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Button,
  Alert,
} from 'react-native';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showModal, hideModal} from '../actions/ModalActions';
import {connectToServer, initDiffieHellman, sendDataToServer} from '../actions/ConnectionActions';
import {LOCAL_SERVER_IP, SERVER_PORT, CONNECTING_TIMEOUT_MILLIS} from '../configs'

const LogInScreen = (props) => {
  //props.connectToServer('192.168.1.19', 20)

  useEffect(() => {
    async function connect() {
      let connected = false;
      const checkConnection = () => {
        props.hideModal();
        if (!connected) {
          props.showModal('Error', {
            displayText: 'Failed to connect to server...',
          });
          console.log('Not connected!!!!');
        }
      };
      await props.connectToServer(
        LOCAL_SERVER_IP,
        SERVER_PORT,
        (address) => {
          console.log('Connected!!!!');
          connected = true;

          //Diffie-Hellman right after establishing connection with server
          props.initDiffieHellman()

        },
        () => {
          props.showModal('Error', {
            displayText: 'Server closed connection',
          })
        },
      );
      props.showModal('Loading', {displayText: 'Connecting to server...'});
      setTimeout(checkConnection, CONNECTING_TIMEOUT_MILLIS);
    }
    connect();
  }, []);

  const [loginValue, setLoginValue] = React.useState('');
  const [passwordValue, setpasswordValue] = React.useState('');

  const signInButtonPressed = () => {
    //props.hideModal();
    //props.connectToServer('192.168.1.19', 20);
    //console.log(props.connectToServer);
    //props.showModal({id: 'Success'});
    props.sendDataToServer(1, "hello from encrypted client", (dataFromServer) => {
      console.log("Data from server decrypted:")
      console.log(dataFromServer)
    })
  };

  const signUpButtonPressed = () => {
    //props.showModal('Success', {displayText: 'Connecting to server...'});
    props.navigation.navigate('Sign Up', { name: 'Jane' })
  };

  return (
    <View style={styles.mainContainer}>
      <Image
        source={require('../images/logo.png')}
        style={styles.logoImage}></Image>
      <TextInput
        style={styles.inputStyle}
        value={loginValue}
        onChangeText={(text) => setLoginValue(text)}
        placeholder="Login"></TextInput>
      <TextInput
        style={styles.inputStyle}
        value={passwordValue}
        onChangeText={(text) => setPasswordValue(text)}
        placeholder="Password"></TextInput>
      <TouchableOpacity
        style={styles.signInButton}
        onPress={signInButtonPressed}>
        <Text style={{fontSize: 20}}>Sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={signUpButtonPressed}>
        <Text style={{fontSize: 20}}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginTop: 50,
  },
  inputStyle: {
    height: 50,
    width: 250,
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 20,
    borderColor: '#67daf9',
    marginTop: 30,
  },
  signInButton: {
    width: 200,
    height: 50,
    marginTop: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#67daf9',
  },
  signUpButton: {
    width: 200,
    height: 50,
    marginTop: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#67daf9',
  },
});

const mapStateToProps = (state) => {
  const {connectionReducer, ModalReducer} = state;
  return {
    ModalReducer,
    connectionReducer,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      hideModal,
      showModal,
      connectToServer,
      initDiffieHellman,
      sendDataToServer,
    },
    dispatch,
  );

const ConnectedLogInScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LogInScreen);

export default ConnectedLogInScreen;
