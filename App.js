/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

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
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { Provider } from 'react-redux';
import { createStore } from 'redux';

import connectionReducer from './src/reducers/ConnectionReducer';
import MyTestTCP from './src/components/MyTestTCP.js'
import Test2 from './src/components/Test2'



const store = createStore(connectionReducer)

export default function App() {
  

  //const options = {port: 20, host: '192.168.1.19'};  //'34.89.236.76'

  //const [clientConnection, setclientConnection] = useState(TcpSocket.createConnection(options, () => {}));
  return(<View>
            <Provider store={store}>
                <MyTestTCP></MyTestTCP>
                {/* <Test2></Test2> */}
            </Provider>
        </View>)
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