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

const MyTestTCP = (props) =>{
    const [optionsData, setOptionsData] = useState('Helloo');
    const [counter, setCounter] = useState(0);

    useEffect(() =>{
      // setclientConnection(TcpSocket.createConnection(options, () => {
      //   // Write on the socket
      //   //client.write('Hello server from React Native!');
      //   // Close socket
      //   //client.destroy();
      // }));
    
      props.connection.on('data', function (data) {
        
        var result = '';
        for (var i = 0; i < data.length; ++i) {
          result += String.fromCharCode(data[i]);
        }
        console.log('message was received', result);
        //optionsData = result
        //Alert.alert(result);
        //client.destroy();
      });
      
      props.connection.on('error', function (error) {
        Alert.alert(error);
      });
      
      props.connection.on('close', function () {
        Alert.alert('Connection closed!');
      });
    }, [])
    
    const buttonClick = () =>{
      setCounter(counter + 1);
      const magicSeq = 0x4D454F57;

      var arr=[];
      arr.push(0)
      const str = "Hello server"
      for(var i=0; i<str.length; i++) {
          arr.push(str.charCodeAt(i))
      }
      
      arr.push(87)
      arr.push(79)
      arr.push(69)
      arr.push(77)


      // var arr1=[];
      // const str1 = "Other packet"
      // for(var i=0; i<str1.length; i++) {
      //   arr1.push(str1.charCodeAt(i))
      // }
    
      // arr1.push(87)
      // arr1.push(79)
      // arr1.push(69)
      // arr1.push(77)

      props.connection.write(arr);
      //props.connection.write(arr1);
      //props.connection.
      //props.connection.write("Second packet to check if splits packets")
      
    }

    const closeConnection = () =>{
      props.connection.destroy();
    }
  
    return (
      <View>
        <Text>Hello</Text>
        <Text>{optionsData}</Text>
        <Button title="Send on server" onPress={buttonClick}></Button>
        <Button title="Close connection" onPress={closeConnection}></Button>
        <StatusBar style="auto"></StatusBar>
        
      </View>
    );

}

export default MyTestTCP;