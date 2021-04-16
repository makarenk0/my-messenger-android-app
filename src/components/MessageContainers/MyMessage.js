import React from 'react';
import {View, Text, StyleSheet, Linking} from 'react-native';

import ChatElement from "./ChatElement";

const MyMessage = (props) => {
  return (
    <ChatElement 
    id={props.id} 
    senderName={null} 
    body={props.body}

    containerStyle={{alignItems: 'flex-end'}}
    messageBoxStyle={{
        maxWidth: "80%",
        backgroundColor: '#00BCD4',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        marginRight: 15,
      }}
      senderNameStyle={{display: "none"}}
      timestampStyle={{fontSize: 11}}
    />
  );
};


export default MyMessage;
