import React from 'react';
import {View, Text, StyleSheet, Linking} from 'react-native';
import Image from 'react-native-scalable-image';

const ChatElement = (props) => {
  const decapsulateDateFromId = (id) => {
    let decapsulatedDate = parseInt(id.substring(0, 8), 16) * 1000;
    let date = new Date(decapsulatedDate);
    return date.toTimeString().split(' ')[0].substr(0, 5);
  };

  const parseMessageContent = (content) => {
    let words = content.split(' ');
    let elements = [];
    let textBuf = '';
    for (var i = 0; i < words.length; i++) {
      if (words[i].substr(0, 4) == 'http') {
        if (textBuf !== '') {
          elements.push(<Text key={i - 1}>{textBuf}</Text>);
          textBuf = '';
        }

        if (words[i].substr(-3) === 'png' || words[i].substr(-3) === 'jpg') {
          elements.push(<Image key={i} source={{uri: words[i]}} width={300} />);
        } else {
          elements.push(
            <Text
              key={i}
              style={{color: 'blue'}}
              onPress={(event) =>
                Linking.openURL(event._dispatchInstances.memoizedProps.children)
              }>
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
    <View style={props.containerStyle}>
      <View style={props.messageBoxStyle}>
        <Text style={props.senderNameStyle}>{props.senderName}</Text>
        {parseMessageContent(props.body)}
        <Text style={props.timestampStyle}>
          {decapsulateDateFromId(props.id)}
        </Text>
      </View>
    </View>
  );
};

export default ChatElement;
