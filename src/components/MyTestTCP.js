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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { connectToServer, initDiffieHellman } from '../actions/ConnectionActions';

const MyTestTCP = (props) =>{
    const [optionsData, setOptionsData] = useState('Helloo');
    const [counter, setCounter] = useState();

    // useEffect(() =>{
    //   // setclientConnection(TcpSocket.createConnection(options, () => {
    //   //   // Write on the socket
    //   //   //client.write('Hello server from React Native!');
    //   //   // Close socket
    //   //   //client.destroy();
    //   // }));
    
    //   props.connection.on('data', function (data) {
        
    //     var result = '';
    //     for (var i = 0; i < data.length; ++i) {
    //       result += String.fromCharCode(data[i]);
    //     }
    //     //console.log(result)
    //     receivePacketFromServer(result.substr(0, result.length - 4))
    //     //optionsData = result
    //     //Alert.alert(result);
    //     //client.destroy();
    //   });
      
    //   props.connection.on('error', function (error) {
    //     Alert.alert(error);
    //   });
      
    //   props.connection.on('close', function () {
    //     Alert.alert('Connection closed!');
    //   });
    // }, [])
    
    const buttonClick = () =>{
      props.connectToServer('34.89.236.76', 20)
      
      //sendPacketToServer("InitDiffieHellman", props.connection)
      
      //var res = CustomModule.show("some text", 10, (res) => {console.log(res)});
      
      //Alert.alert(res.charAt(0))
      // setCounter(counter + 1);
      // sendPacketToServer("InitDiffieHellman", props.connection)

      // var arr=[];
      // arr.push(0)
      // const str = "Hello server"
      // for(var i=0; i<str.length; i++) {
      //     arr.push(str.charCodeAt(i))
      // }
      
      // arr.push(87)
      // arr.push(79)
      // arr.push(69)
      // arr.push(77)


      // var arr1=[];
      // const str1 = "Other packet"
      // for(var i=0; i<str1.length; i++) {
      //   arr1.push(str1.charCodeAt(i))
      // }
    
      // arr1.push(87)
      // arr1.push(79)
      // arr1.push(69)
      // arr1.push(77)

      //props.connection.write(arr);
      //props.connection.write(arr1);
      //props.connection.
      //props.connection.write("Second packet to check if splits packets")
    }

    const diffieHellmanInit = () =>{
      props.initDiffieHellman()
    }

    const closeConnection = () =>{
      //props.connection
      props.connection.current.establishedConnection.destroy()
    }
  
    return (
      <View>
        <Text>Hello</Text>
        <Text>{optionsData}</Text>
        <Button title="Connect" onPress={buttonClick}></Button>
        <Button title="Diffie hellman" onPress={diffieHellmanInit}></Button>
        <Button title="Close connection" onPress={closeConnection}></Button>
        <StatusBar style="auto"></StatusBar>
        
      </View>
    );

}

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    connectToServer,
    initDiffieHellman,
  }, dispatch)
);

const mapStateToProps = (state) => {
  const { connection } = state
  return { connection }
};

export default connect(mapStateToProps, mapDispatchToProps)(MyTestTCP);