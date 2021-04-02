import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Button,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showModal, hideModal} from '../actions/ModalActions';
import {
  connectToServer,
  initDiffieHellman,
  sendDataToServer,
  setSessionTokenAndId,
} from '../actions/ConnectionActions';
import {
  LOCAL_SERVER_IP,
  SERVER_PORT,
  CONNECTING_TIMEOUT_MILLIS,
} from '../configs';

const LogInScreen = (props) => {
  //props.connectToServer('192.168.1.19', 20)
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberIsSelected, setRemember] = useState(false);
  const [loginValue, setLoginValue] = React.useState('');
  const [passwordValue, setPasswordValue] = React.useState('');

  const autoLogin = () =>{
    const getLoginData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('loginData')
        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch (e) {
        console.log(e)
      }
    }
    getLoginData().then((data) =>{
      if(data != null && data.remember){
        logIntoAccount(data.login, data.password, data.remember)
      }
    })
  }


  const logIntoAccount = (login, password, rememberUser) =>{
    setErrorText('');
    let regObj = {
      Login: login,
      Password: password,
    };
    setLoading(true);

    props.sendDataToServer(2, true, regObj, async(response) => {
      setLoading(false);
      if (response.Status == 'error') {
        setErrorText(response.Details);
      } else {
        
        
        props.setSessionTokenAndId(response.SessionToken, response.Id);
        let saveLogPassObj
        if(rememberUser){
          saveLogPassObj = {
            remember: true,
            login: login,
            password: password,
          }
        }
        else{
          saveLogPassObj = {
            remember: false,
          }
        }

        try {
          const jsonValue = JSON.stringify(saveLogPassObj)
          await AsyncStorage.setItem('loginData', jsonValue)
        } catch (e) {
          console.log(e)
        }

        props.navigation.navigate('Home', {test: "hello"});
      }
      //console.log(props.connectionReducer.connection.current.sessionToken)
    });
  }



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
          props.initDiffieHellman((response) =>{
            autoLogin()
          });
        },
        () => {
          props.showModal('Error', {
            displayText: 'Server closed connection',
          });
        },
      );
      props.showModal('Loading', {displayText: 'Connecting to server...'});
      setTimeout(checkConnection, CONNECTING_TIMEOUT_MILLIS);
    }
    connect();
  }, []);

  

  const signInButtonPressed = () => {
    logIntoAccount(loginValue, passwordValue, rememberIsSelected)

    
    //props.hideModal();
    //props.connectToServer('192.168.1.19', 20);
    //console.log(props.connectToServer);
    //props.showModal({id: 'Success'});
    // props.sendDataToServer(1, "hello from encrypted client", (dataFromServer) => {
    //   console.log("Data from server decrypted:")
    //   console.log(dataFromServer)
    // })
  };

  const signUpButtonPressed = () => {
    //props.showModal('Success', {displayText: 'Connecting to server...'});
    props.navigation.navigate('Sign Up', {name: 'Jane'});
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
      <View style={styles.rememberMeBox}>
        <CheckBox
          value={rememberIsSelected}
          onValueChange={setRemember}
          style={styles.rememberMe}
        />
        <Text style={styles.rememberMeText}>Remember me</Text>
      </View>

      <Text style={styles.inputErrorText}>{errorText}</Text>
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
      <ActivityIndicator style={styles.loadIndicator} animating={loading} size="large" color="#67daf9" />
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
    marginTop: 30,
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
  inputErrorText: {
    color: '#a52a2a',
    marginTop: 20,
  },
  rememberMeBox: {
    marginTop: 20,
    flexDirection: 'row',
    height: 30,
    width: 250,
  },
  rememberMeCheckBox: {
    
  },
  rememberMeText:{
    fontSize: 18,
    paddingTop: 2,
    paddingLeft: 6,
  },
  loadIndicator: {
    marginTop: 15,
  }
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
      setSessionTokenAndId,
    },
    dispatch,
  );

const ConnectedLogInScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LogInScreen);

export default ConnectedLogInScreen;
