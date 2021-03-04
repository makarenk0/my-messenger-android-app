import React, {useState, useEffect} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Button,
    Alert,
  } from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { connectToServer } from '../actions/ConnectionActions';

const Test2 = (props) =>{


    const closeConnection = () =>{
        //props.connection
        props.connection.current.establishedConnection.destroy()
      }
    return(
        <View>
            <Button title="Close connection" onPress={closeConnection}></Button>
        </View>
    )
}


const mapDispatchToProps = dispatch => (
    bindActionCreators({
      connectToServer,
    }, dispatch)
  );
  
  const mapStateToProps = (state) => {
    const { connection } = state
    return { connection }
  };
  
  export default connect(mapStateToProps, mapDispatchToProps)(Test2);