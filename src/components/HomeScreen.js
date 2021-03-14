import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Button,
  Alert,
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showModal, hideModal} from '../actions/ModalActions';
import {connectToServer, sendDataToServer} from '../actions/ConnectionActions';

const HomeScreen = (props) =>{
    return(
        <View>
            <Text>Home screen</Text>
        </View>
    )
}

const mapStateToProps = (state) => {
    const {connectionReducer, ModalReducer} = state;
    return {
      ModalReducer,
      connectionReducer,
    };
  };
  
  const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
      {
        hideModal,
        showModal,
        connectToServer,
        sendDataToServer,
      },
      dispatch,
    );
  
  const ConnectedHomeScreen = connect(
    mapStateToProps,
    mapDispatchToProps,
  )(HomeScreen);
  
  export default ConnectedHomeScreen;