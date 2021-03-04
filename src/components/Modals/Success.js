import * as React from 'react';
import {useRef} from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  Modal,
  Easing,
} from 'react-native';

const Success = (props) => {
  return (
    <View style={styles.mainView}>
      <ActivityIndicator size="large" color="#fff" style={styles.loaderStyle} />
      <Text style={styles.loaderText}>Connecting...</Text>
    </View>
  );
};
//style={{translateY: transAnim, height: 40, backgroundColor: '#67daf9'}}
const styles = StyleSheet.create({
  mainView: {
    height: 40,
    flexDirection: 'row',
  },
  loaderStyle: {
    marginLeft: 20
  },
  loaderText: {
    marginLeft: 20,
    fontSize: 20,
    textAlignVertical: 'center',
  }
});

export default Success;
