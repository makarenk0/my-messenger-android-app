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
import { greaterThan } from 'react-native-reanimated';
import {SlidingAlert, show} from './SlidingAlert';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {ModalActions} from '../store/modules/Modal/ModalActions'
import {showModal} from '../store/modules/Modal/ModalActions'
//import {showModal} from '../store/modules/Modal/ModalActions'
import { connectToServer, initDiffieHellman } from '../actions/ConnectionActions';

const LogInScreen = (props) => {
  const [loginValue, setLoginValue] = React.useState('');
  const [passwordValue, setpasswordValue] = React.useState('');

  const signInButtonPressed = () => {
    console.log(props.connectToServer)
    //props.showModal({id: 'Success'});
    props.connectToServer('192.168.1.19', 20)
  }

  const signUpButtonPressed = () => {
    console.log(props)
    props.showModal({id: 'Success'});
   //props.navigation.navigate('Sign Up', { name: 'Jane' })
  }

  return (
    <View style={styles.mainContainer}>
      <Image source={require('../images/logo.png')} style={styles.logoImage}></Image>
      <TextInput style = {styles.inputStyle} value={loginValue} onChangeText={text => setLoginValue(text)} placeholder="Login"></TextInput>
      <TextInput style = {styles.inputStyle} value={passwordValue} onChangeText={text => setPasswordValue(text)} placeholder="Password"></TextInput>
      <TouchableOpacity style = {styles.signInButton} onPress={signInButtonPressed}>
        <Text style={{fontSize: 20}}>Sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity style = {styles.signUpButton} onPress={signUpButtonPressed}>
        <Text style={{fontSize: 20}}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer:{
    alignItems: 'center',
  },
  logoImage:{
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
    backgroundColor: "#67daf9",
  },
  signUpButton: {
    width: 200,
    height: 50,
    marginTop: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#67daf9",
  },

});

const mapStateToProps = state => {
  console.log(state)
  const { connectionReducer, ModalReducer} = state
  return {
    ModalReducer,
    connectionReducer,
  };
};

const mapDispatchToProps = {
  showModal: showModal,
  connectToServer: connectToServer,
};

// const mapDispatchToProps = dispatch => (
//   bindActionCreators({
//     connectToServer,
//     initDiffieHellman,
//   }, dispatch)
// );


const ConnectedLogInScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LogInScreen);

export default ConnectedLogInScreen;

