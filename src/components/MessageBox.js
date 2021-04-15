import React, { useState } from 'react';
import {View, Text, StyleSheet, Linking} from 'react-native';
import Image from 'react-native-scalable-image';

const MessageBox = (props) => {

  const [messageElements, setMessageElements] = useState(props.body.split(' '))
  const parseMessageContent = (content) => {
    
    let words = content.split(' ');

    let elements = [];
    let textBuf = '';
    for (var i = 0; i < words.length; i++) {
      if (words[i].substr(0, 4) == 'http') {

        if(textBuf !== ""){
          elements.push(<Text key={i - 1}>{textBuf}</Text>);
          textBuf = '';
        }
       
        if (words[i].substr(-3) === 'png' || words[i].substr(-3) === 'jpg') {
          elements.push(
            <Image
              key={i}
              source={{uri: words[i]}}
              width={300}
            />,
          );
        } else {
          elements.push(
            <Text key={i}
              style={{color: 'blue'}}
              onPress={(event) => Linking.openURL(event._dispatchInstances.memoizedProps.children)}>
              {words[i]}
            </Text>,
          );
        }
      } else {
        textBuf = textBuf.concat(i === 0 ? '' : ' ', words[i]);
      }
    }
    if (textBuf !== '') {
      elements.push(<Text key={i}>{textBuf}</Text>);
    }
    return <View>{elements}</View>;
  };

  return (
    <View style={{alignItems: props.isMine ? 'flex-end' : 'flex-start'}}>
      <View
        style={
          props.isSystem
            ? {
                maxWidth: "80%",
                backgroundColor: '#b8b5ff',
                borderRadius: 5,
                paddingLeft: 8,
                paddingRight: 8,
                marginTop: 10,
                alignSelf: 'center',
              }
            : {
                maxWidth: "80%",
                backgroundColor: props.isMine ? '#00BCD4' : '#03a9f4',
                padding: 10,
                borderRadius: 5,
                marginTop: 10,
                marginRight: props.isMine ? 15 : 0,
                marginLeft: props.isMine ? 0 : 15,
              }
        }>
        {!props.isMine && !props.isSystem && props.isGroup ? (
          <Text style={styles.senderName}>{props.memberName}</Text>
        ) : null}
        {parseMessageContent(props.body)}
        <Text
          style={
            props.isSystem
              ? {
                  alignSelf: 'center',
                }
              : styles.timestamp
          }>
          {props.isSystem ? 'at ' : null}
          {props.timestamp}
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
    paddingBottom: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  senderName: {
    fontWeight: 'bold',
    paddingBottom: 2,
  },
});

export default MessageBox;
