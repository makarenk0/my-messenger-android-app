import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Animated,
  BackHandler,
} from 'react-native';
import {faUsers} from '@fortawesome/free-solid-svg-icons';

import {FloatingAction} from 'react-native-floating-action';
import {Button} from 'react-native-elements';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faBars} from '@fortawesome/free-solid-svg-icons';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showModal, hideModal} from '../actions/ModalActions';
import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
  unsubscribeFromUpdate,
  destroyConnection,
} from '../actions/ConnectionActions';
import {
  loadDB,
  saveDocToDB,
  loadDocFromDB,
  removeDocFromDB,
  addOneToArray,
  addManyToArray,
  removeFromArray,
  getProjected,
  updateValue,
} from '../actions/LocalDBActions';

import ChatRepresenter from './ChatRepresenter';

const HomeScreen = (props) => {
  const [allChats, setAllChats] = useState([]);
  const [assistantChatId, setAssistantChatId] = useState(
    props.connectionReducer.connection.current.currentUser.AssistantChatId,
  );
  const [screenLoading, setScreenLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState('');

  let logoAnim = useRef(new Animated.Value(0)).current;

  const handleBackPress = () => {
    let unsubscribePromise = new Promise((resolve, reject) => {
      props.unsubscribeFromUpdate('homescreen', (removed) => {
        console.log('Subscription removed:');
        console.log(removed);
        resolve();
      });
    });
    unsubscribePromise.then(() => {
      let destroyPromise = new Promise((resolve, reject) => {
        props.destroyConnection(() => {
          console.log('Connection destroyd');
          resolve();
        });
      });
      destroyPromise.then(() => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
        BackHandler.exitApp();
      });
    });
  };

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('blur', () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    });
    return unsubscribe;
  }, [props.navigation]);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    });
    return unsubscribe;
  }, [props.navigation]);

  const startLogoAnim = () => {
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 25000,
      useNativeDriver: true,
    }).start();
  };

  const stopLogoAnim = () => {
    setScreenLoading(false);
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 25000,
      useNativeDriver: true,
    }).stop();
  };

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      setCurrentChat('');
    });

    return unsubscribe;
  }, [props.navigation]);

  const addNewChatToDB = (chat) => {
    let newMessages = chat.NewMessages;
    props.saveDocToDB(
      {
        _id: chat.ChatId,
        ChatName: chat.ChatName,
        Members: chat.Members,
        Messages: chat.NewMessages,
        NewMessagesNum: newMessages.length,
        IsGroup: chat.IsGroup,
        Admin: chat.Admin,
        LastMessageId: newMessages[newMessages.length - 1]._id,
      },
      (err, newDoc) => {
        console.log('New chat in DB');
        //updating array with existing chats ids
        props.addOneToArray(
          {Type: 'localChatsIds'},
          {ChatIds: chat.ChatId},
          (err, docs) => {
            console.log(err);
            console.log(docs);
          },
        );
      },
    );
  };

  const updateExistingChatInDB = (chat) => {
    let newMessages = chat.NewMessages;

    //adding all new messages to messages array
    console.log('adding all new messages to messages array');
    let addMessagesPromise = new Promise((resolve, reject) => {
      props.addManyToArray({_id: chat.ChatId}, 'Messages', newMessages, () => {
        resolve();
      });
    });
    addMessagesPromise.then(() => {
      props.getProjected({_id: chat.ChatId}, {NewMessagesNum: 1}, (promise) => {
        promise.then((el) => {
          console.log('Updating in DB');
          console.log(currentChat);
          let toUpdate = {
            NewMessagesNum:
              el[0].NewMessagesNum +
              (chat.ChatId !== currentChat ? newMessages.length : 0),
            LastMessageId: newMessages[newMessages.length - 1]._id,
          };

          if (chat.Admin !== null) {
            toUpdate['Admin'] = chat.Admin;
          }
          //updating "Members" field in case of change
          if (chat.Members != null) {
            
            
            //removing chat if we were kicked(server won't send update to us on this chat)
            if (
              !chat.Members.includes(
                props.connectionReducer.connection.current.currentUser.UserId,
              )
            ) {
              let removeChatPromise = new Promise((resolve, reject) => {
                props.removeDocFromDB({"_id": chat.ChatId}, true, (err, numberOfRemoved) => {
                  resolve();
                });
              });
              removeChatPromise.then(() => {
                let loadPresentChats = new Promise((resolve, reject) => {
                  props.loadDocFromDB({Type: 'localChatsIds'}, (err, docs) => {
                    resolve(docs);
                  });
                });
                loadPresentChats.then((data) => {
                  let updatedLocalChatIds = data[0].ChatIds.filter(
                    (x) => x != chat.ChatId,
                  );
                  props.updateValue(
                    {Type: 'localChatsIds'}, {ChatIds: updatedLocalChatIds},
                    () => {},
                  );
                });
              });
              return;
            }
            toUpdate['Members'] = chat.Members;
          }

          props.updateValue({_id: chat.ChatId}, toUpdate, () => {
            console.log('Local chat ' + chat.ChatId + ' was updated');
          });
        });
      });
    });
  };

  const updateAllChatsToDisplay = (local, updated) => {
    // updating "allChats" array which is used to display chats
    // increasing new messages counter
    local = local.map((x) => {
      let update = updated.find((y) => y.chatId == x.chatId);
      console.log('CURRENT CHAT');
      console.log(currentChat);
      if (typeof update !== 'undefined') {
        //update counter only in case there is an update
        x.newMessagesNum +=
          update.chatId !== currentChat ? update.newMessagesNum : 0;
        if (update.admin !== null) x.admin = update.admin;
        if (update.chatMembers !== null) {
          if (
            !update.chatMembers.includes(
              props.connectionReducer.connection.current.currentUser.UserId,
            )
          ) {
            if (currentChat == update.chatId) {
              //TO DO: user is currently in chat and need to make a signal to chat screen to close it
              //setCurrentChat(null);
            }
            return null;
          }
          x.chatMembers = update.chatMembers;
        }
      }
      return x;
    });
    local = local.filter((x) => x != null);

    //adding new chats
    let newChats = updated.filter((x) => x.isNew);
    local.unshift(...newChats);

    //applying changes
    console.log('Changing all chats data to display');
    local.sort((a, b) => {
      if (a.chatId === assistantChatId) {
        return -1;
      }
      return 0;
    });
    setAllChats(local);
  };

  useEffect(() => {
    props.subscribeToUpdate('5', 'homescreen', (data) => {
      console.log(data);
      console.log(data.IsNew);
      if (data.IsNew) {
        console.log('Adding new chat in real-time');
        addNewChatToDB(data);
      } else {
        console.log('Updating existing chat in real-time');
        updateExistingChatInDB(data);
      }
      let ChatRepresentorsUpdatedData = [];
      ChatRepresentorsUpdatedData.push({
        chatId: data.ChatId,
        chatName: data.ChatName,
        chatMembers: data.Members,
        isNew: data.IsNew,
        isGroup: data.IsGroup,
        admin: data.Admin,
        newMessagesNum: data.NewMessages.length,
      });
      updateAllChatsToDisplay(allChats, ChatRepresentorsUpdatedData);
    });
    return function cleanup(){
      props.unsubscribeFromUpdate('homescreen', (removed) => {
        console.log('Subscription removed:');
        console.log(removed);
      });
    }
  }, [allChats, currentChat]);

  const zeroPacketRequest = (LastChatsData, ChatRepresentorsLocalData) => {
    console.log('zero packet call');

    let regObj = {
      SessionToken: props.connectionReducer.connection.current.sessionToken,
      SubscriptionPacketNumber: '5', //packet number which server will use for real-time update
      LastChatsData: LastChatsData,
    };

    //after "LastChatsMessages" array formed - send it to server and subscribe for real-time update on packet number 5
    props.sendDataToServer('7', true, regObj, (response) => {
      let ChatRepresentorsUpdatedData = []; // this array will be a response data for "LastChatsMessages" array
      if (response.Status == 'error') {
        //in case of some error
        console.log(response.Details);
      } else {
        //in case of success

        // going through server response array of new messages and new chats(if there are such)
        response.AllChats.forEach((element) => {
          if (element.IsNew) {
            addNewChatToDB(element); //adding new chat to database
          } else {
            updateExistingChatInDB(element); //update existing chat in DB
          }
          // --------------------------

          // pushing new data to "ChatRepresentorsUpdatedData" array
          ChatRepresentorsUpdatedData.push({
            chatId: element.ChatId,
            chatName: element.ChatName,
            chatMembers: element.Members,
            isNew: element.IsNew,
            isGroup: element.IsGroup,
            admin: element.Admin,
            newMessagesNum: element.NewMessages.length,
          });
          // -----------------------
        });
      }
      updateAllChatsToDisplay(
        ChatRepresentorsLocalData,
        ChatRepresentorsUpdatedData,
      );
    });
  };

  useEffect(() => {
    props.loadDB('localDB');

    //show all
    // props.loadDocFromDB({}, (err, docs) => {
    //   console.log('');
    //   console.log('All docs:');
    //   console.log(docs);
    //   console.log('');
    // });

    //remove all
    // props.removeDocFromDB({}, true, (err, numberOfRemoved) =>{
    //    console.log(numberOfRemoved)
    // })

    // props.saveDocToDB({Type: 'localChatsIds', ChatIds: ["6052553af34ec222c2c36a57"]}, (err, newDoc) =>{
    //   console.log(newDoc)
    // })

    // props.saveDocToDB({_id: '6052553af34ec222c2c36a57', ChatName: "some_name", Members: ["604e35066b4e72e77404925b", "6052036cb9277234a5b10187"], Messages:
    // [{_id: '60526d82fd5b47331d0f0401', Sender: '604e35066b4e72e77404925b', Body: "Second message add to db"}], LastMessageId: "60526d82fd5b47331d0f0401"}, (err, newDoc) =>{
    //   console.log(newDoc)
    // })

    // props.removeDocFromDB({_id: '6052553af34ec222c2c36a57'}, true, (err, numberOfRemoved) =>{
    //   console.log(numberOfRemoved)
    // })

    //   props.addToArray({Type: 'localChatsIds'}, {ChatIds: "605210b6ca1a7d4c922dd7c5"}, (err, docs) =>{
    //     console.log(docs)
    // })

    // props.removeFromArray({type: 'localChatsIds'}, {chatIds: "605210b6ca1a7d4c922dd7c5"}, (err, docs) =>{
    //       console.log(docs)
    //   })

    // props.loadDocFromDB({_id: '6052553af34ec222c2c36a57'}, (err, docs) =>{
    //   console.log(docs[0])
    // })

    props.loadDocFromDB({Type: 'localChatsIds'}, (err, docs) => {
      if (docs.length == 0) {
        props.saveDocToDB(
          {Type: 'localChatsIds', ChatIds: []},
          (err, newDoc) => {
            console.log('Local chats initialized');
            zeroPacketRequest([], []);
          },
        );
      } else if (docs[0].ChatIds.length == 0) {
        zeroPacketRequest([], []);
      } else {
        let LastChatsMessages = []; //this array will be send to server and server will determine which new messages do you need (or new chats)
        var ChatRepresentorsLocalData = []; // this array is formed with data of chats which are stored locally

        let allPreojectionPromises = []; // as access to local db is async, each request for chat return promise, so to get all chats and then do something we should wait for all promises
        docs[0].ChatIds.forEach((chatId) => {
          console.log(chatId);

          //we need only projections (Only "LastMessageId" field, "ChatName" field and "Members" field )
          props.getProjected(
            {_id: chatId},
            {
              LastMessageId: 1,
              ChatName: 1,
              Members: 1,
              NewMessagesNum: 1,
              IsGroup: 1,
              Admin: 1,
            },
            (promise) => {
              promise.then((lastMessageId) => {
                //pushing data from db to array
                ChatRepresentorsLocalData.push({
                  chatId: chatId,
                  chatName: lastMessageId[0].ChatName,
                  chatMembers: lastMessageId[0].Members,
                  isGroup: lastMessageId[0].IsGroup,
                  admin: lastMessageId[0].Admin,
                  newMessagesNum: lastMessageId[0].NewMessagesNum, //TO DO: create a field of number of new messages in db
                });
                //pushing "ChatId" and "LastMessageId" to array which will be send to server
                LastChatsMessages.push({
                  ChatId: chatId,
                  Members: lastMessageId[0].Members,
                  Admin: lastMessageId[0].Admin,
                  LastMessageId: lastMessageId[0].LastMessageId,
                });
              });
              allPreojectionPromises.push(promise); //pushing all promises to array
            },
          );
          //--------------------------------------------------------------------------------------------
        });
        // waiting for all requests are completed on database
        Promise.all(allPreojectionPromises).then((res) => {
          zeroPacketRequest(LastChatsMessages, ChatRepresentorsLocalData);
        });
      }
    });
  }, []);

  // in case of chat is pressed (navigating to "ChatScreen" and passing chatId )
  const chatPressed = (chatId, chatName) => {
    setCurrentChat(chatId);

    let goToChatIndex = allChats.findIndex((x) => x.chatId == chatId);
    let updated = allChats;
    updated[goToChatIndex].newMessagesNum = 0;
    setAllChats(updated);

    props.navigation.navigate('ChatScreen', {
      chatId: chatId,
      chatName: chatName,
    });
  };

  const actions = [
    {
      text: 'Add group chat',
      icon: require('../images/group.png'),
      name: 'bt_group_chat',
      buttonSize: 60,
      margin: 5,
      position: 0,
    },
  ];

  const spin = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '4952deg'],
  });

  return (
    <View style={{height: '100%'}}>
      <View
        style={{
          height: 55,
          width: '100%',
          backgroundColor: '#1597bb',
          flexDirection: 'row',
        }}>
        <Button
          style={{borderRadius: 25}}
          containerStyle={{
            width: 50,
            marginTop: 5,
            marginLeft: 5,
            height: 45,
            borderRadius: 25,
          }}
          buttonStyle={{backgroundColor: '#1597bb', borderRadius: 25}}
          icon={
            <FontAwesomeIcon
              icon={faBars}
              size={25}
              style={{marginTop: 2}}
              onPress={() => {
                props.navigation.openDrawer();
              }}
            />
          }
        />
        <Text
          style={{fontSize: 22, textAlignVertical: 'center', paddingLeft: 10}}>
          Chats
        </Text>

        <TouchableOpacity
          style={{
            width: 50,
            height: 50,
            position: 'absolute',
            top: 2,
            right: 5,
            height: 45,
          }}
          onPress={() => {
            startLogoAnim();
          }}>
          <Animated.Image
            style={{
              transform: [{rotate: spin}],
              width: 50,
              height: 50,
              alignSelf: 'center',
              resizeMode: 'contain',
            }}
            source={require('../images/logoLoader.png')}
          />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {allChats.map((x) => (
          <ChatRepresenter
            key={x.chatId}
            chatId={x.chatId}
            chatName={x.chatName}
            newMessagesNum={x.newMessagesNum}
            isAssistant={x.chatId === assistantChatId}
            isGroup={x.isGroup}
            onPress={chatPressed}></ChatRepresenter>
        ))}
      </ScrollView>
      <FloatingAction
        actions={actions}
        buttonSize={70}
        //distanceToEdge={{vertical: 100, horizontal: 10}}
        onPressItem={(name) => {
          switch (name) {
            case 'bt_group_chat':
              props.navigation.navigate('CreateGroupChatScreen', {});
              break;
            default:
              break;
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  const {connectionReducer, ModalReducer, localDBReducer} = state;
  return {
    ModalReducer,
    connectionReducer,
    localDBReducer,
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
      loadDB,
      saveDocToDB,
      loadDocFromDB,
      removeDocFromDB,
      addOneToArray,
      addManyToArray,
      removeFromArray,
      getProjected,
      updateValue,
      destroyConnection,
      unsubscribeFromUpdate,
    },
    dispatch,
  );

const ConnectedHomeScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeScreen);

export default ConnectedHomeScreen;
