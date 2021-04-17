import React from 'react';
import ChatElement from './ChatElement';

const OtherUserPublicMessage = (props) => {
  return (
    <ChatElement
      id={props.id}
      senderName={props.senderName}
      body={props.body}
      containerStyle={{alignItems: 'flex-start'}}
      messageBoxStyle={{
        maxWidth: '80%',
        backgroundColor: '#03a9f4',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        marginLeft: 15,
      }}
      senderNameStyle={{fontWeight: 'bold', paddingBottom: 2}}
      timestampStyle={{fontSize: 11}}
    />
  );
};

export default OtherUserPublicMessage;
