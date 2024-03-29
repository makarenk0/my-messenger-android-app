import React, {useState, useEffect} from 'react';
import {NavigationEvents} from '@react-navigation/native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import {faEllipsisV} from '@fortawesome/free-solid-svg-icons';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {Avatar, Overlay, Icon, Button} from 'react-native-elements';
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
  Modal,
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showModal, hideModal} from '../actions/ModalActions';
import {StackActions} from '@react-navigation/native';
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

import {isEmptyOrSpaces} from './Utilities';

import MyMessage from './MessageContainers/MyMessage';
import OtherUserPrivateMessage from './MessageContainers/OtherUserPrivateMessage';
import OtherUserPublicMessage from './MessageContainers/OtherUserPublicMessage';
import SystemMessage from './MessageContainers/SystemMessage';
import GroupChatPanel from './ChatTabs/GroupChatPanel';

const ChatScreen = (props) => {
  const chatId = props.route.params.chatId;
  const [toSend, setSendMessage] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [reRenderFlag, setRerenderFlag] = useState(true);
  const [isGroup, setGroupFlag] = useState(false);
  const [isAssistant, setAssistantFlag] = useState(
    chatId ===
      props.connectionReducer.connection.current.currentUser.AssistantChatId,
  );
  const [membersInfo, setMembersInfo] = useState([]);
  const [removedMembersInfo, setRemovedMembersInfo] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [deleteMsgVisibility, setDeleteMsgVisibility] = useState(false);
  const [admin, setAdmin] = useState('');
  const [chatTabVisibility, setChatTabVisibility] = useState(false);

  //load members list
  const getAllMembers = (members) => {
    console.log('members');
    console.log(members);
    var membersAbsentLocally = [];
    var membersPresentLocally = [];

    let promises = [];
    members.forEach((x) => {
      console.log('member iterate');
      promises.push(
        new Promise((resolve, reject) => {
          props.loadDocFromDB({UserId: x}, (err, doc) => {
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
        props.sendDataToServer('3', true, finUsersObj, (response) => {
          if (response.Status == 'success') {
            setMembersInfo([
              //...membersInfo,
              ...response.Users,
              ...membersPresentLocally,
            ]);

            response.Users.forEach((x) => {
              x['Type'] = 'localUser';
              props.saveDocToDB(x, () => {});
            });
          } else {
            console.log(response.Status);
            console.log(response.Details);
          }
        });
      } else {
        setMembersInfo([...membersPresentLocally]);
      }
    });
  };

  useEffect(() => {
    let removedMembersIds = allMessages
      .filter((x) => {
        return (
          x.Sender != 'System' &&
          x.Sender != 'assistant' &&
          membersInfo.findIndex((y) => y.UserId === x.Sender) == -1
        );
      })
      .map((x) => x.Sender);
    let uniqueMembers = [...new Set(removedMembersIds)];
    if (uniqueMembers.length > 0) {
      getRemovedMembersInfo(uniqueMembers);
    }
  }, [membersInfo]);

  useEffect(() => {
    console.log(membersInfo);
    setRerenderFlag(!reRenderFlag);
  }, [membersInfo]);

  const getRemovedMembersInfo = (ids) => {
    let finUsersObj = {
      SessionToken: props.connectionReducer.connection.current.sessionToken,
      UserIds: ids,
    };
    console.log(finUsersObj);
    props.sendDataToServer('3', true, finUsersObj, (response) => {
      if (response.Status == 'success') {
        setRemovedMembersInfo([...response.Users]);
      } else {
        console.log(response.Status);
        console.log(response.Details);
      }
    });
  };

  const sendMessage = () => {
    if (!isEmptyOrSpaces(toSend)) {
      setSendMessage('');
      if (chatId != 'new') {
        let sendObj = {
          SessionToken: props.connectionReducer.connection.current.sessionToken,
          ChatId: chatId,
          Body: toSend,
        };
        props.sendDataToServer(
          isAssistant ? 'a' : '4',
          true,
          sendObj,
          (response) => {
            console.log(response);
            // setAllMessages([response, ...allMessages])
            // setRerenderFlag(!reRenderFlag)
          },
        );
      } else {
        let sendObj = {
          SessionToken: props.connectionReducer.connection.current.sessionToken,
          UserIds: [
            props.route.params.userId,
            props.connectionReducer.connection.current.currentUser.UserId,
          ],
          Body: toSend,
        };
        props.sendDataToServer('6', true, sendObj, (response) => {
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
    BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    //return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  }, []);

  //getting chat data
  useEffect(() => {
    let loadChatsPromise = new Promise((resolve, reject) => {
      props.loadDocFromDB({_id: chatId}, (err, docs) => {
        resolve(docs);
      });
    });
    loadChatsPromise.then((docs) => {
      if (docs.length == 1) {
        let chat = docs[0];
        setAllMessages(chat.Messages.reverse());
        setAdmin(chat.Admin);
        setGroupFlag(chat.IsGroup);
        getAllMembers(chat.Members);
        props.updateValue({_id: chat._id}, {NewMessagesNum: 0});
      }
    });
  }, []);

  useEffect(() => {
    props.subscribeToUpdate('5', 'chatscreen', (data) => {
      if (data.ChatId == chatId) {
        let newMessages = data.NewMessages.reverse();
        console.log(newMessages);
        if (data.Members != null) {
          if (
            !data.Members.includes(
              props.connectionReducer.connection.current.currentUser.UserId,
            )
          ) {
            leaveChat();
          } else {
            console.log('DATA CHAT MEMBERS:');
            getAllMembers(data.Members);
          }
        }
        if (data.Admin != null) {
          setAdmin(data.Admin);
        }

        setAllMessages([...newMessages, ...allMessages]);
        setRerenderFlag(!reRenderFlag);
      }
    });
    return function cleanup() {
      console.log('CLEANUP WORKS');
      props.unsubscribeFromUpdate('chatscreen', (removed) => {
        console.log('Subscription removed:');
        console.log(removed);
      });
    };
  }, [allMessages]);

  const renderItem = ({item}) => {
    if(item.IsDeleted){
      return null;
    }

    if (
      props.connectionReducer.connection.current.currentUser.UserId ===
      item.Sender
    ) {
      return (
        <MyMessage
          id={item._id}
          body={item.Body}
          isSelected={selectedMessages.includes(item._id)}
          selectedMessageAction={selectedMessageAction}
        />
      );
    } else if (item.Sender == 'System') {
      return <SystemMessage id={item._id} body={item.Body} />;
    } else if (isGroup) {
      let memberInfoIndex = membersInfo.findIndex(
        (y) => y.UserId == item.Sender,
      );
      let memberInfo;
      if (memberInfoIndex != -1) {
        memberInfo = membersInfo[memberInfoIndex];
      } else {
        let removedMemberInfoIndex = removedMembersInfo.findIndex(
          (y) => y.UserId == item.Sender,
        );
        memberInfo = removedMembersInfo[removedMemberInfoIndex];
      }

      let senderName =
        memberInfo == null
          ? ''
          : memberInfo.FirstName + ' ' + memberInfo.LastName;
      return (
        <OtherUserPublicMessage
          id={item._id}
          senderName={senderName}
          body={item.Body}
          isSelected={selectedMessages.includes(item._id)}
          selectedMessageAction={selectedMessageAction}
        />
      );
    } else {
      return (
        <OtherUserPrivateMessage
          id={item._id}
          body={item.Body}
          isSelected={selectedMessages.includes(item._id)}
          selectedMessageAction={selectedMessageAction}
        />
      );
    }
  };

  const selectedMessageAction = (id) => {
    if (selectedMessages.includes(id)) {
      setSelectedMessages(selectedMessages.filter((x) => x !== id));
    } else {
      setSelectedMessages([...selectedMessages, id]);
    }
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

  const leaveChat = () => {
    const popAction = StackActions.pop(1);
    props.navigation.dispatch(popAction);
  };

  const deleteMessagesForUser = () => {
    let sendObj = {
      ChatId: chatId,
      MessagesIds: selectedMessages,
    };
    props.sendDataToServer('d', true, sendObj, (response) => {
      if (response.Status == 'success') {
        selectedMessages.forEach(x => {
          props.removeFromArray(
            {_id: chatId},
            {Messages: {_id: x}},
            (err, docs) => {
              console.log(docs);
            },
          );
        })
        setSelectedMessages([]);
      }
      setAllMessages(allMessages.filter(x => !selectedMessages.includes(x._id)))
      setDeleteMsgVisibility(!deleteMsgVisibility);

    });
  };

  return (
    <View style={styles.mainContainer}>
      {isGroup ? (
        <GroupChatPanel
          chatId={chatId}
          membersInfo={membersInfo}
          chatTabVisibility={chatTabVisibility}
          setChatTabVisibility={setChatTabVisibility}
          isAdmin={
            props.connectionReducer.connection.current.currentUser.UserId ==
            admin
          }
        />
      ) : null}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteMsgVisibility}
        onRequestClose={() => {
          setDeleteMsgVisibility(!deleteMsgVisibility);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>
              {selectedMessages.length} message(s) will be deleted for you
              forever
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
                width: 160,
              }}>
              <View style={{marginRight: 50}}>
                <Button
                  buttonStyle={{backgroundColor: '#DC143C'}}
                  title="Cancel"
                  onPress={() => {
                    setSelectedMessages([]);
                    setDeleteMsgVisibility(!deleteMsgVisibility);
                  }}></Button>
              </View>
              <View>
                <Button
                  title="Ok"
                  onPress={() => {
                    deleteMessagesForUser();
                  }}></Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.chatHeader}>
        {isAssistant ? (
          <Avatar
            rounded
            size={55}
            source={require('../images/assistant_logo.jpg')}
            containerStyle={{
              backgroundColor: '#ccc',
              marginTop: 5,
              marginBottom: 10,
              marginLeft: 10,
            }}
            activeOpacity={0.7}
          />
        ) : (
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
        )}
        <Text style={styles.chatName}>{props.route.params.chatName}</Text>
        <View style={styles.headerButtons}>
          {selectedMessages.length > 0 ? (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                setDeleteMsgVisibility(!deleteMsgVisibility);
              }}>
              <FontAwesomeIcon
                icon={faTrash}
                size={28}
                style={styles.sendIcon}
              />
            </TouchableOpacity>
          ) : null}
          {isGroup ? (
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => {
                setChatTabVisibility(true);
                //sendMessage();
              }}>
              <FontAwesomeIcon
                icon={faEllipsisV}
                size={28}
                style={styles.sendIcon}
              />
            </TouchableOpacity>
          ) : null}
        </View>
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
  headerButtons: {
    position: 'absolute',
    right: 10,
    top: 18,
    flexDirection: 'row',
  },
  deleteButton: {
    marginRight: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
