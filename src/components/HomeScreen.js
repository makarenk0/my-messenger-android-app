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
import {loadDB, saveDocToDB, loadDocFromDB, removeDocFromDB, addToArray, removeFromArray} from '../actions/LocalDBActions'

import ChatRepresenter from './ChatRepresenter';

const HomeScreen = (props) => {
  useEffect(() =>{
    props.loadDB('localDB')

    // props.saveDocToDB({type: 'localChatsIds', chatIds: ["6052553af34ec222c2c36a57"]}, (err, newDoc) =>{
    //   console.log(newDoc)
    // })
    // props.removeDocFromDB({type: 'localChatsIds'}, true, (err, numberOfRemoved) =>{
    //   console.log(numberOfRemoved)
    // })

  //   props.addToArray({type: 'localChatsIds'}, {chatIds: "605210b6ca1a7d4c922dd7c5"}, (err, docs) =>{
  //     console.log(docs)
  // })

  // props.removeFromArray({type: 'localChatsIds'}, {chatIds: "605210b6ca1a7d4c922dd7c5"}, (err, docs) =>{
  //       console.log(docs)
  //   })

    props.loadDocFromDB({type: 'localChatsIds'}, (err, docs) =>{
        console.log(docs)
    })

    

  }, [])


  return (
    <View>
      <ScrollView>
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
        <ChatRepresenter></ChatRepresenter>
        <ChatRepresenter></ChatRepresenter>
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
    localDBReducer
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
      addToArray,
      removeFromArray
    },
    dispatch,
  );

const ConnectedHomeScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeScreen);

export default ConnectedHomeScreen;
