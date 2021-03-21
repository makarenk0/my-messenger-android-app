import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showModal, hideModal} from '../actions/ModalActions';
import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
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
  const [updatedChats, setUpdatedChats] = useState([]);

  useEffect(() =>{
    console.log("all chats changed!!")
    console.log(allChats)
  }, [allChats])


  useEffect(() => {
    props.loadDB('localDB');

    //show all
    props.loadDocFromDB({}, (err, docs) => {
      console.log('');
      console.log('All docs:');
      console.log(docs);
      console.log('');
    });

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
      var LastChatsMessages = [];
      var ChatRepresentorsData = [];
      let allPreojectionPromises = [];

      docs[0].ChatIds.forEach((chatId) => {
        console.log(chatId);
        props.getProjected(
          {_id: chatId},
          {LastMessageId: 1, ChatName: 1, Members: 1},
          (promise) => {
            promise.then((lastMessageId) => {
              console.log(lastMessageId[0].ChatName);
              ChatRepresentorsData.push({
                chatId: chatId,
                chatName: lastMessageId[0].ChatName,
                chatMembers: lastMessageId[0].Members,
                newMessagesNum: 0,
              });
              LastChatsMessages.push({
                ChatId: chatId,
                LastMessageId: lastMessageId[0].LastMessageId,
              });
            });
            allPreojectionPromises.push(promise);
          },
        );
      });
      Promise.all(allPreojectionPromises).then((res) => {
        let regObj = {
          SessionToken: props.connectionReducer.connection.current.sessionToken,
          SubscriptionPacketNumber: '5',
          LastChatsMessages: LastChatsMessages,
        };
        setAllChats(ChatRepresentorsData);
        props.sendDataToServer(7, true, regObj, (response) => {
          if (response.Status == 'error') {
            console.log(response.Details);
          } else {
            //setAllChats(response.AllChats)
            response.AllChats.forEach((element) => {
              let newMessages = element.NewMessages;


              // LOCAL DATABASE UPDATE
              if (element.ChatName != null) {
                //add new chat to DB
                props.saveDocToDB({_id: element.ChatId, ChatName: element.ChatName, Members: element.Members, Messages: element.NewMessages, LastMessageId: newMessages.length > 0 ? newMessages[newMessages.length - 1]._id : null}, (err, newDoc) =>{
                  console.log("New chat in DB")

                  //updating array with existing chats
                  props.addToArray({Type: 'localChatsIds'}, {ChatIds: element.ChatId}, (err, docs) =>{
                    console.log(err)  
                    console.log(docs)
                  })

                })
              } else if (newMessages.length > 0) {
                //update existing chat in DB
                props.addManyToArray(
                  {_id: element.ChatId},
                  'Messages',
                  newMessages,
                );
                props.updateValue(
                  {_id: element.ChatId},
                  {LastMessageId: newMessages[newMessages.length - 1]._id},
                );
              }
              // -----------------------
              console.log(element)
              // DISPLAY DATA UPDATE

              setUpdatedChats(oldData => [...oldData, {chatId: element.ChatId, chatName: element.ChatName, chatMembers: element.Members, newMessagesNum: element.NewMessages.length}])
              // -----------------------

            });

            console.log(response.Details);
          }
        });


      });
    }); 
  }, []);

  

  return (
    <View>
      <ScrollView>
        {allChats.map((x) => (
          <ChatRepresenter
            key={x.chatId}
            chatName={x.chatName}
            newMessagesNum={updatedChats.length > 0 ? updatedChats.find(el => el.chatId == x.chatId).newMessagesNum : x.newMessagesNum}></ChatRepresenter>
        ))}
        {/* <ChatRepresenter></ChatRepresenter>
        <ChatRepresenter></ChatRepresenter>
        <ChatRepresenter></ChatRepresenter>
        <ChatRepresenter></ChatRepresenter>
        <ChatRepresenter></ChatRepresenter>
        <ChatRepresenter></ChatRepresenter>
        <ChatRepresenter></ChatRepresenter>
        <ChatRepresenter></ChatRepresenter>
        <ChatRepresenter></ChatRepresenter>
        <ChatRepresenter></ChatRepresenter>
        <ChatRepresenter></ChatRepresenter>
        <ChatRepresenter></ChatRepresenter> */}
      </ScrollView>
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
    },
    dispatch,
  );

const ConnectedHomeScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeScreen);

export default ConnectedHomeScreen;
