import React , { useState } from 'react';
import ChatElement from "./ChatElement";

const OtherUserPrivateMessage = (props) => {
  return (
    <ChatElement 
    id={props.id} 
    senderName={null} 
    body={props.body}
    onPressMsg={(id) => {props.selectedMessageAction(id)}}
    containerStyle={{alignItems: 'flex-start'}}
    messageBoxStyle={{
        maxWidth: "80%",
        backgroundColor: props.isSelected ? '#fd805d': '#03a9f4',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        marginLeft: 15,
      }}
      senderNameStyle={{display: "none"}}
      timestampStyle={{fontSize: 11}}
    />
  );
};


export default OtherUserPrivateMessage;
