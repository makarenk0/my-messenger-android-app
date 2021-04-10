import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const MessageBox = (props) => {
  return (
    <View style={{alignItems: props.isMine ? 'flex-end' : 'flex-start'}}>
      <View
        style={
          props.isSystem
            ? {
                backgroundColor: "#b8b5ff",
                borderRadius: 5,
                paddingLeft: 8,
                paddingRight: 8,
                marginTop: 10,
                alignSelf: "center"
            }
            : {
                backgroundColor: props.isMine ? '#00BCD4' : '#03a9f4',
                padding: 10,
                borderRadius: 5,
                marginTop: 10,
                marginRight: props.isMine ? 15 : 0,
                marginLeft: props.isMine ? 0 : 15,
              }
        }>
          {!props.isMine && !props.isSystem && props.isGroup ? <Text style={styles.senderName}>{props.memberName}</Text> : null}
        <Text style={styles.body}>{props.body}</Text>
        <Text style={props.isSystem ? {
          alignSelf: "center"
        }: styles.timestamp}>
          {props.isSystem ? "at " : null}{props.timestamp}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'green',
  },
  body: {
    maxWidth: '80%',
  },
  timestamp: {
    fontSize: 11,
  },
  senderName:{
    fontWeight: "bold",
    paddingBottom: 2
  }
});

export default MessageBox;
