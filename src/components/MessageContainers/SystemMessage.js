import React from 'react';
import ChatElement from './ChatElement';

const SystemMessage = (props) => {
  return (
    <ChatElement
      id={props.id}
      senderName={null}
      body={props.body}
      onPressMsg={(id) => {}}
      containerStyle={{alignItems: 'flex-start'}}
      messageBoxStyle={{
        maxWidth: '80%',
        backgroundColor: '#b8b5ff',
        borderRadius: 5,
        paddingLeft: 8,
        paddingRight: 8,
        marginTop: 10,
        alignSelf: 'center',
      }}
      senderNameStyle={{display: "none"}}
      timestampStyle={{alignSelf: 'center'}}
    />
  );
};

export default SystemMessage;
