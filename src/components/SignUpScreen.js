import React, {useState, useEffect} from 'react';
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
  const [passwordValue, setpasswordValue] = useState('');

  const signInButtonPressed = () => {
      
  }

  const signUpButtonPressed = () => {
   props.navigation.navigate('Sign Up', { name: 'Jane' })
  }

  return (
    <View style={styles.mainContainer}>
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

});

export default SignUpScreen;