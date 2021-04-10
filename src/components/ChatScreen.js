import React, {useState, useEffect, useCallback} from 'react';
import {NavigationEvents} from '@react-navigation/native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import {Avatar} from 'react-native-elements';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  BackHandler,
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
  saveDocToDB,
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
  const [reRenderFlag, setRerenderFlag] = useState(true);
  const [isGroup, setGroupFlag] = useState(false);
  const [membersInfo, setMembersInfo] = useState([]);

  //load members list
  const getAllMembers = async (members) => {
    console.log('members');
    console.log(members);
    var membersAbsentLocally = [];
    var membersPresentLocally = [];

    let promises = [];
    members.forEach((x) => {
      console.log('member iterate');
      promises.push(
        new Promise((resolve, reject) => {
          props.loadDocFromDB({UserID: x}, (err, doc) => {
            console.log(doc.length);
            if (doc.length > 0) {
              console.log('User info loaded locally');
              membersPresentLocally.push(doc[0]);
            } else {
              console.log(x);
              membersAbsentLocally.push(x);
            }
            resolve('done');
          });
        }),
      );
    });
    Promise.all(promises).then((res) => {
      if (membersAbsentLocally.length != 0) {
        console.log('to server');
        let finUsersObj = {
          SessionToken: props.connectionReducer.connection.current.sessionToken,
          UserIds: membersAbsentLocally,
        };
        console.log(finUsersObj);
        props.sendDataToServer(3, true, finUsersObj, (response) => {
          if (response.Status == 'success') {
            setMembersInfo([...membersInfo, ...response.Users, ...membersPresentLocally]);

            response.Users.forEach((x) => {
              x['Type'] = 'localUser'
              props.saveDocToDB(x, () => {});
            });
          } else {
            console.log(response.Status);
            console.log(response.Details);
          }
        });
      }
      else{
        setMembersInfo([...membersInfo, ...membersPresentLocally]);
      }
      
    });
  };

  useEffect(() => {
    console.log(membersInfo);
    setRerenderFlag(!reRenderFlag);
  }, [membersInfo]);

  const sendMessage = () => {
    if (!isEmptyOrSpaces(toSend)) {
      setSendMessage('');
      if (chatId != 'new') {
        let sendObj = {
          SessionToken: props.connectionReducer.connection.current.sessionToken,
          ChatId: chatId,
          Body: toSend,
        };
        props.sendDataToServer(4, true, sendObj, (response) => {
          console.log(response);
          // setAllMessages([response, ...allMessages])
          // setRerenderFlag(!reRenderFlag)
        });
      } else {
        let sendObj = {
          SessionToken: props.connectionReducer.connection.current.sessionToken,
          UserIds: [
            props.route.params.userId,
            props.connectionReducer.connection.current.myId,
          ],
          Body: toSend,
        };
        props.sendDataToServer(6, true, sendObj, (response) => {
          //only for private chats
          console.log(response);
          props.navigation.setParams({
            chatId: response.ChatId,
          });

          setAllMessages([...response.NewMessages, ...allMessages]);
        });
      }
    }
  };

  useEffect(() => {
    setRerenderFlag(!reRenderFlag);
  }, [allMessages]);

  const handleBackPress = () => {
    props.navigation.navigate('Chats', {
      backFromChat: chatId,
    });
    BackHandler.removeEventListener('hardwareBackPress', handleBackPress);

    props.unsubscribeFromUpdate('chatscreen', (removed) => {
      console.log('Subscription removed:');
      console.log(removed);
    });

    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  }, []);

  const isEmptyOrSpaces = (str) => {
    return str === null || str.match(/^ *$/) !== null;
  };

  //getting chat data
  useEffect(() => {
    props.loadDocFromDB({_id: chatId}, (err, docs) => {
      if (docs.length == 1) {
        let chat = docs[0];
        setAllMessages(chat.Messages.reverse());
        setGroupFlag(chat.IsGroup);
        getAllMembers(chat.Members);
      }
    });
  }, []);

  useEffect(() => {
    props.subscribeToUpdate(5, 'chatscreen', (data) => {
      if (data.ChatId == chatId) {
        let newMessages = data.NewMessages;
        setAllMessages([...newMessages, ...allMessages]);
        setRerenderFlag(!reRenderFlag);
      }
    });
  }, [allMessages]);

  // useEffect(() => {
  //   console.log("All messages changed!!!!!!!!!!!")
  //   console.log(allMessages)
  // }, [allMessages])

  // action when leave screen
  useEffect(() => {
    const unsubscribe = props.navigation.addListener('beforeRemove', () => {});

    return unsubscribe;
  }, [props.navigation]);

  const decapsulateDateFromId = (id) => {
    let decapsulatedDate = parseInt(id.substring(0, 8), 16) * 1000;
    let date = new Date(decapsulatedDate);
    return date.toTimeString().split(' ')[0].substr(0, 5);
  };

  const renderItem = ({item}) => {
    let memberInfoIndex = membersInfo.findIndex((x) => x.UserID == item.Sender);
    let memberInfo;
    if (memberInfoIndex != -1) {
      memberInfo = membersInfo[memberInfoIndex];
    }
    return (
      <MessageBox
        body={item.Body}
        isGroup={isGroup}
        isSystem={item.Sender == 'System'}
        isMine={props.connectionReducer.connection.current.myId == item.Sender}
        memberName={
          memberInfo == null
            ? ''
            : memberInfo.FirstName + ' ' + memberInfo.LastName
        }
        timestamp={decapsulateDateFromId(item._id)}></MessageBox>
    );
  };

  const ChatThreadSeparator = (item) => {
    const index = 0; //allMessages.findIndex(x => x._id == item.leadingItem._id)   //disabled
    let sameDate = true;
    if (index > 0) {
      const currentMessageTime = decapsulateDateFromId(item.leadingItem._id);
      var nextMessageTime = decapsulateDateFromId(allMessages[index - 1]._id);
      sameDate =
        currentMessageTime.getDate() == nextMessageTime.getDate() &&
        currentMessageTime.getMonth() == nextMessageTime.getMonth();
    }

    return !sameDate ? (
      <View
        style={{
          alignItems: 'center',
          paddingTop: 10,
          paddingBottom: 10,
        }}>
        <Text
          style={{
            backgroundColor: '#009688',
            borderRadius: 5,
            paddingLeft: 8,
            paddingRight: 8,
          }}>
          {nextMessageTime.toDateString()}
        </Text>
      </View>
    ) : null;
  };

  const chatEndRiched = () => {
    console.log('end reached');
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.chatHeader}>
        <Avatar
          rounded
          size={55}
          icon={{name: isGroup ? 'users' : 'user', type: 'font-awesome'}}
          containerStyle={{
            backgroundColor: '#ccc',
            marginTop: 5,
            marginBottom: 10,
            marginLeft: 10,
          }}
          activeOpacity={0.7}
        />
        <Text style={styles.chatName}>{props.route.params.chatName}</Text>
      </View>
      <View style={styles.messagesWindow}>
        <FlatList
          style={styles.messageThread}
          inverted
          data={allMessages}
          renderItem={renderItem}
          ItemSeparatorComponent={ChatThreadSeparator}
          keyExtractor={(item) => item._id}
          extraData={reRenderFlag}
          onEndReached={chatEndRiched}></FlatList>
      </View>
      <View style={styles.sendMessageBox}>
        <TextInput
          style={styles.inputStyle}
          value={toSend}
          onChangeText={(text) => setSendMessage(text)}
          placeholder="Message"></TextInput>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => {
            sendMessage();
          }}>
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
    backgroundColor: '#3F51B5',
    flexDirection: 'row',
  },
  messagesWindow: {
    flex: 1,
  },
  chatName: {
    marginLeft: 20,
    fontSize: 20,
    textAlignVertical: 'center',
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
      saveDocToDB,
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
