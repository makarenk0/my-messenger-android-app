import React from 'react';
import {View, Text, StyleSheet, Linking, TouchableOpacity} from 'react-native';
import {
  OpenGraphAwareInput,
  OpenGraphDisplay,
  OpenGraphParser,
} from 'react-native-opengraph-kit';
import Image from 'react-native-scalable-image';

function checkIfJson(content) {
  if (
    /^[\],:{}\s]*$/.test(
      content
        .replace(/\\["\\\/bfnrtu]/g, '@')
        .replace(
          /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
          ']',
        )
        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''),
    )
  ) {
    return true;
  }
  return false;
}

const ChatElement = (props) => {
  const decapsulateDateFromId = (id) => {
    let decapsulatedDate = parseInt(id.substring(0, 8), 16) * 1000;
    let date = new Date(decapsulatedDate);
    return date.toTimeString().split(' ')[0].substr(0, 5);
  };

  const parseMessageContent = (content) => {
    if (checkIfJson(content)) {
      let ogData = JSON.parse(content)
      return (
        <View style={{width: 300, height: 325}}>
          <OpenGraphDisplay
            key={i}
            data={{
              description: ogData.description,
              image: ogData.image,
              title: ogData.title,
              url: ogData.url,
            }}
            imageStyle={{
              width: 290,
              flex: 2
            }}
            containerStyle={{height: 315, backgroundColor: "#03a9f4"}}
            touchContainerStyle={{flexDirection: 'column', height: '100%',  borderColor: "#03a9f4"}}
            descriptionStyle={{height: 100}}
            textContainerStyle={{flex: 1}}
            urlStyle={{display: 'none'}}
          />
          <Text style={{position: 'absolute', right: 12, top: 310, fontWeight: 'bold'}}>Read more</Text>
        </View>
      );
    }

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
          elements.push(<View key={i} style={{alignSelf: 'center'}}><Image source={{uri: words[i]}} height={150}/></View>);
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
      } else if (words[i] == '\n') {
        elements.push(<Text key={i}>{textBuf}</Text>);
        textBuf = '';
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
    <TouchableOpacity
      activeOpacity={1}
      style={props.containerStyle}
      onPress={() => {
        props.onPressMsg(props.id);
      }}>
      <View style={props.messageBoxStyle}>
        <Text style={props.senderNameStyle}>{props.senderName}</Text>
        {parseMessageContent(props.body)}
        <Text style={props.timestampStyle}>
          {decapsulateDateFromId(props.id)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChatElement;
