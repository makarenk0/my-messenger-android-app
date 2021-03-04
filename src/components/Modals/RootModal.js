import * as React from 'react';
import {useRef} from 'react'
import {Modal, Button, View, StyleSheet, Animated, Easing} from 'react-native';
import {connect} from 'react-redux';
import Error from './Error';
import Success from './Success';


const Modals = {
  Error: Error,
  Success: Success,
};

const RootModal = (props) => {
  const {id, modalProps} = props;

  const ModalView = Modals[id] || function () {};

  const transAnim = useRef(new Animated.Value(-40)).current;

    Animated.timing(transAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.bounce,
    }).start();
  

  return (
    Boolean(id) ?
    <Animated.View style={{width: '100%', position: 'absolute', translateY: transAnim, height: 40, backgroundColor: '#67daf9'}}>
      <ModalView {...modalProps} />
    </Animated.View> : null
  );
};
//{/* <Button onPress={hideModal} title="Close" color="blue" /> */}

const mapStateToProps = (state) => {
  return {
    id: state.ModalReducer.id,
    modalProps: state.ModalReducer.modalProps,
  };
};


const ConnectedRootModal = connect(
  mapStateToProps,
)(RootModal);

export default ConnectedRootModal;
