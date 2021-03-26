import React, {useState, useEffect, useCallback} from 'react';
import {NavigationEvents} from '@react-navigation/native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showModal, hideModal} from '../actions/ModalActions';
import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
  unsubscribeFromUpdate,
} from '../actions/ConnectionActions';

import {
  loadDocFromDB,
  removeDocFromDB,
  addOneToArray,
  addManyToArray,
  removeFromArray,
  getProjected,
  updateValue,
} from '../actions/LocalDBActions';
import MessageBox from './MessageBox';

const ChatScreen = (props) => {
  const chatId = props.route.params.chatId;
  const [toSend, setSendMessage] = useState('');
  const [allMessages, setAllMessages] = useState([]);


  const sendMessage = () => {
    if(!isEmptyOrSpaces(toSend)){
      let sendObj = {
        SessionToken: props.connectionReducer.connection.current.sessionToken,
        ChatId: chatId,
        Body: toSend,
      };
      props.sendDataToServer(4, true, sendObj, (response) => {
        console.log(response);
        setAllMessages([...allMessages, response])
        setSendMessage('');
      });
    }
  };

  const isEmptyOrSpaces = (str) =>{
    return str === null || str.match(/^ *$/) !== null;
  }

  //getting chat data
  useEffect(() => {
    props.loadDocFromDB({_id: chatId}, (err, docs) =>{
        let chat = docs[0]
        
        setAllMessages(chat.Messages)
    })
  }, []);

  useEffect(() => {
    console.log();
    props.subscribeToUpdate(5, 'chatscreen', (data) => {
      if (data.ChatId == chatId) {
        let newMessages = data.NewMessages.filter(x => x.Sender != props.connectionReducer.connection.current.myId)
        setAllMessages([...allMessages, ...newMessages])
      }
    });
  }, [allMessages]);

  // useEffect(() => {
  //   console.log("All messages changed!!!!!!!!!!!")
  //   console.log(allMessages)
  // }, [allMessages])

  // action when leave screen
  useEffect(() => {
    const unsubscribe = props.navigation.addListener('beforeRemove', () => {
      props.unsubscribeFromUpdate('chatscreen', (removed) => {
        console.log('Subscription removed:');
        console.log(removed);
      });
    });

    return unsubscribe;
  }, [props.navigation]);

  const decapsulateDateFromId = (id) =>{
    let decapsulatedDate = parseInt(id.substring(0, 8), 16) * 1000
    let date = new Date(decapsulatedDate)
    return date
  }

  const renderItem = ({ item }) => {
    return(
      <MessageBox body={item.Body} isMine={props.connectionReducer.connection.current.myId == item.Sender} timestamp={decapsulateDateFromId(item._id)}></MessageBox>
    )
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.chatHeader}>
        <Image style={styles.chatImage}></Image>
        <Text style={styles.chatName}>{props.route.params.chatName}</Text>
      </View>
      <View style={styles.messagesWindow}>
        <FlatList style={styles.messageThread}
        ref={ref => {scrollView = ref}}
        onContentSizeChange={() => scrollView.scrollToEnd({animated: true})}
        data={allMessages}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}>
          {/* {allMessages.map((x) => (
            <MessageBox key={x._id} body={x.Body} isMine={props.connectionReducer.connection.current.myId == x.Sender} timestamp={decapsulateDateFromId(x._id)}></MessageBox>
            // <Text key={x._id}>{x.Body}</Text>
          ))} */}
        </FlatList>
      </View>
      <View style={styles.sendMessageBox}>
        <TextInput
          style={styles.inputStyle}
          value={toSend}
          onChangeText={(text) => setSendMessage(text)}
          placeholder="Message"></TextInput>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <FontAwesomeIcon
            icon={faPaperPlane}
            size={28}
            style={styles.sendIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  chatHeader: {
    height: 65,
    backgroundColor: "#3F51B5",
    flexDirection: "row",
  },
  messagesWindow: {
    flex: 1,
  },
  chatName: {
    marginLeft: 20,
    fontSize: 20,
    textAlignVertical: "center",
  },
  sendMessageBox: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
  },
  chatImage: {
    marginTop: 8,
    marginBottom: 10,
    marginLeft: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
  },
  messageThread: {
    width: '100%',
    height: '100%',
  },
  inputStyle: {
    height: 55,
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 20,
    fontSize: 20,
    borderColor: '#67daf9',
  },
  sendButton: {
    height: 55,
    width: 55,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#67daf9',
    marginLeft: 10,
  },
  sendIcon: {},
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
      unsubscribeFromUpdate,
      loadDocFromDB,
      removeDocFromDB,
      addOneToArray,
      addManyToArray,
      removeFromArray,
      getProjected,
      updateValue,
    },
    dispatch,
  );

const ConnectedChatScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChatScreen);

export default ConnectedChatScreen;
