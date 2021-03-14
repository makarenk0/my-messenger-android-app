/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Modal,
  Button,
  Alert,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {Provider} from 'react-redux';
import {createStore} from 'redux';

import connectionReducer from './src/reducers/ConnectionReducer';
//import modalReducer from './src/reducers/ModalReducer';
import MyTestTCP from './src/components/MyTestTCP.js';
import Test2 from './src/components/Test2';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import LogInScreen from './src/components/LogInScreen';
import SignUpScreen from './src/components/SignUpScreen';
import HomeScreen from './src/components/HomeScreen';
import RootModal from './src/components/Modals/RootModal'


import {ModalReducer} from './src/reducers/ModalReducer';
import {combineReducers} from 'redux';




const store = createStore(combineReducers({connectionReducer, ModalReducer}))

const Stack = createStackNavigator();



export default function App() {
 
  //const options = {port: 20, host: '192.168.1.19'};  //'34.89.236.76'
  //const [clientConnection, setclientConnection] = useState(TcpSocket.createConnection(options, () => {}));



  return (
    <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="LogInScreen"
              component={LogInScreen}
              options={{headerShown: false}}
            />
            {/* <MyTestTCP></MyTestTCP> */}
            <Stack.Screen name="Sign Up" component={SignUpScreen} />
            <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
          </Stack.Navigator>
        </NavigationContainer>
        <RootModal />
      {/* <Modal animationType="slide" visible={modalVisibility} transparent={true}><Text>This is modal</Text></Modal> */}
    </Provider>
  );
}


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

//export default App;
