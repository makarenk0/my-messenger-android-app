import React, {useState, useEffect} from 'react';
import {
  DrawerItemList,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {removeDocFromDB, updateValue} from '../actions/LocalDBActions';
import {
  unsubscribeFromUpdate,
  destroyConnection,
} from '../actions/ConnectionActions';
import {CommonActions} from '@react-navigation/native';
import {Button, Avatar} from 'react-native-elements';

import {
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Linking,
} from 'react-native';

const DrawerContent = (props) => {
  const logOut = async () => {
    //remove all user data (saved chats, other data)
    let removeDocsPromise = new Promise((resolve, reject) => {
      props.removeDocFromDB({}, true, (err, numberOfRemoved) => {
        console.log('All user data removed');
        console.log(numberOfRemoved);
        resolve();
      });
    });
    removeDocsPromise.then(() => {
      AsyncStorage.setItem('loginData', JSON.stringify({remember: false})); //disabling auto log in

      let unsubscribePromise = new Promise((resolve, reject) => {
        resolve();
        // props.unsubscribeFromUpdate('homescreen', (removed) => {
        //   console.log('Subscription removed:');
        //   console.log(removed);
        //   resolve();
        // });
      });
      unsubscribePromise.then(() => {
        let destroyPromise = new Promise((resolve, reject) => {
          props.destroyConnection(() => {
            console.log('Connection destroyd');
            resolve();
          });
        });
        destroyPromise.then(() => {
          props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'Log In'}],
            }),
          );
        });
      });
    });

    //props.navigation.dispatch(StackActions.replace('Log In', {}));
  };
  return (
    <DrawerContentScrollView {...props}>
      <View style={{flexDirection: 'row'}}>
        <Avatar
          rounded
          size={80}
          icon={{
            name: 'user',
            type: 'font-awesome',
          }}
          containerStyle={{
            backgroundColor: '#ccc',
            marginTop: 10,
            marginBottom: 10,
            marginLeft: 10,
          }}
          activeOpacity={0.7}
        />
        <View style={{marginLeft: 15, marginTop: 8}}>
          <Text style={{fontSize: 20}}>
            {props.connectionReducer.connection.current.currentUser.FirstName}{' '}
            {props.connectionReducer.connection.current.currentUser.LastName}
          </Text>
          <Text style={{marginTop: 5, fontWeight: 'bold'}}>
            @{props.connectionReducer.connection.current.currentUser.Login}
          </Text>
        </View>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Help"
        icon={() => <FontAwesomeIcon icon={faInfoCircle} size={25} />}
        labelStyle={{fontWeight: 'bold', fontSize: 15}}
        onPress={() => Linking.openURL('https://google.com/')}
      />
      <Button
        onPress={logOut}
        buttonStyle={{justifyContent: 'flex-start', height: 50}}
        containerStyle={{width: 260, height: 50, marginLeft: 10}}
        iconContainerStyle={{marginRight: 10}}
        icon={<FontAwesomeIcon icon={faSignOutAlt} size={25} />}
        type="clear"
        title="       Log out"
      />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  logOutButton: {
    width: 150,
    height: 40,
    backgroundColor: '#8ED1FC',
    marginLeft: 10,
    flexDirection: 'row',
  },
  logOutIcon: {
    position: 'absolute',
    right: 5,
    top: 10,
  },
});

const mapStateToProps = (state) => {
  const {localDBReducer, connectionReducer} = state;
  return {
    localDBReducer,
    connectionReducer,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      removeDocFromDB,
      updateValue,
      unsubscribeFromUpdate,
      destroyConnection,
    },
    dispatch,
  );

const ConnectedDrawerContent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrawerContent);

export default ConnectedDrawerContent;
