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
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showModal, hideModal} from '../actions/ModalActions';
import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
} from '../actions/ConnectionActions';
import {ForceTouchGestureHandler} from 'react-native-gesture-handler';

const HomeScreen = (props) => {
  const [timer, setTimer] = useState(null);
  const [counter, setCounter] = useState(0);

  const [toSend, setSendMessage] = useState('');
  const [allMessages, setAllMessages] = useState([])

  const sendMessage = () =>{
    let sendObj = {
      SessionToken: props.connectionReducer.connection.current.sessionToken,
      ChatId: '6052553af34ec222c2c36a57',
      Body: toSend
    };
    props.sendDataToServer(4, true, sendObj, (response) =>{
      console.log(response)
      
    })
  }

  useEffect(() =>{
    let regObj = {
      SessionToken: props.connectionReducer.connection.current.sessionToken,
      SubscriptionPacketNumber: '5',
      LastChatsMessages: [
        {
          ChatId: '6052553af34ec222c2c36a57',
          LastMessageId: '60528fbde61d9cbb373c1b07',
        },
      ],
    };
    props.sendDataToServer(7, true, regObj, (response) => {
      if (response.Status == 'error') {
        console.log(response);
      } else {
        console.log(response);
      }
    });
  }, [])


  useEffect(() => {
    console.log("subscribe once")
    props.subscribeToUpdate(5, (data) => {
      let newData = data.NewMessages
      setAllMessages(oldData => [...oldData, ...newData])
    });
  }, []);

  useEffect(() => {
    console.log("All messages changed!!!!!!!!!!!")
    console.log(allMessages)
  }, [allMessages])
  // const tick = () =>{
  //   console.log(counter)
  //   props.sendDataToServer(3, {"some": "something"}, (response) => {
  //     console.log(response)
  //   });
  // }

  // useEffect(() => {
  //   let timerFunc = setInterval(tick, 200);
  //   setTimer(timerFunc)
  //   return () => {clearInterval(timerFunc)}
  // }, [])

  return (
    <View>
      
      <TextInput
        style={styles.inputStyle}
        value={toSend}
        onChangeText={(text) => setSendMessage(text)}
        placeholder="Message"></TextInput>
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={sendMessage}>
        <Text style={{fontSize: 20}}>Send</Text>
      </TouchableOpacity>
      <ScrollView>{allMessages.map(x => (<Text key={x._id}>{x.Body}</Text>))}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  texts: {
    marginTop: 350,
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
      sendDataToServer,
      subscribeToUpdate,
    },
    dispatch,
  );

const ConnectedHomeScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeScreen);

export default ConnectedHomeScreen;
