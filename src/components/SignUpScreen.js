import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Alert,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';

const SignUpScreen = (props) => {

  const [loginValue, setLoginValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [errorText, setErrorText] = useState('');

  var passwordReg = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  const signUpButtonPressed = () => {
   if(!passwordReg.test(passwordValue)){
    setErrorText("Password must contain:\nat least 1 lowercase character,\nat least 1 uppercase character,\nat least 1 numeric character,\nat least one special character,\nmust be eight characters or longer")
    return
   }
   props.c
  
  }

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.inputErrorText}>{errorText}</Text>
      <TextInput
        style={styles.inputStyle}
        value={loginValue}
        onChangeText={(text) => setLoginValue(text)}
        placeholder="Login"></TextInput>
      <TextInput
        style={styles.inputStyle}
        value={passwordValue}
        onChangeText={(text) => {setPasswordValue(text); setErrorText('')}}
        placeholder="Password"></TextInput>
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={signUpButtonPressed}>
        <Text style={{fontSize: 20}}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer:{
    alignItems: 'center',
    paddingTop: 200,
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
  signUpButton: {
    width: 200,
    height: 50,
    marginTop: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#67daf9",
  },
  inputErrorText: {
    position: 'absolute',
    color: '#a52a2a',
    marginTop: 100,
  }
});

export default SignUpScreen;
