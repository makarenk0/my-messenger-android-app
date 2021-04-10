import {View, Text, StyleSheet, ScrollView, TextInput} from 'react-native';
import {SearchBar, Input, Card, Button} from 'react-native-elements';
import React, {useState, useEffect} from 'react';
import {FlatList} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
} from '../actions/ConnectionActions';
import {
  loadDB,
  saveDocToDB,
  loadDocFromDB,
  removeDocFromDB,
  addOneToArray,
  addManyToArray,
  removeFromArray,
  getProjected,
  updateValue,
} from '../actions/LocalDBActions';
import {SEARCH_USERS_WAIT_TIMEOUT} from '../configs';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faUsers} from '@fortawesome/free-solid-svg-icons';
import {faUserPlus} from '@fortawesome/free-solid-svg-icons';
import {faUserCheck} from '@fortawesome/free-solid-svg-icons';
import UserRepresenter from './UserRepresenter';

const CreateGroupChatScreen = (props) => {
  const [searchField, setSearchField] = useState('');
  const [chatName, setChatName] = useState('');
  const [chatUsers, setChatUsers] = useState([]);
  const [resultUsers, setResultUsers] = useState([]);
  const [userInputTimer, setUserInputTimer] = useState('');
  const [loading, setLoading] = useState(false);
  const [rerenderMembersFlag, setRerenderMembersFlag] = useState(true);
  const [rerenderToAddFlag, setRerenderToAddFlag] = useState(true);
  const [canCreate, setCanCreate] = useState(false);

  const isEmptyOrSpaces = (str) => {
    return str === null || str.match(/^ *$/) !== null;
  };

  const createButtonPressed = () => {
    let chatUserWithOwner = chatUsers.map(x => x.UserID)
    chatUserWithOwner.push(props.connectionReducer.connection.current.myId)
    let sendObj = {
        SessionToken: props.connectionReducer.connection.current.sessionToken,
        UserIds: chatUserWithOwner,
        ChatName: chatName
      };
      props.sendDataToServer(8, true, sendObj, (response) => {   //only for private chats
        if(response.status = "success"){
            props.navigation.goBack()
        }
      });
  }

  useEffect(() => {
    console.log('can create ');
    setCanCreate(chatUsers.length > 0 && chatName != '');
  }, [chatName, chatUsers]);

  useEffect(() => {
    if (userInputTimer !== '') {
      clearTimeout(userInputTimer);
    }
    setLoading(true);
    setUserInputTimer(setTimeout(requestToServer, SEARCH_USERS_WAIT_TIMEOUT));
    setResultUsers([]);
  }, [searchField, rerenderMembersFlag]);

  const requestToServer = () => {
    setLoading(false);
    if (!isEmptyOrSpaces(searchField)) {
      let finUsersObj = {
        SessionToken: props.connectionReducer.connection.current.sessionToken,
        FindUsersRequest: searchField,
      };

      props.sendDataToServer(3, true, finUsersObj, (response) => {
        if (response.Status == 'success') {
          console.log(response.Users);
          let all = response.Users;
          all = all.filter(
            (x) => chatUsers.findIndex((y) => y.UserID == x.UserID) == -1,
          );
          setResultUsers(all);
        } else {
          console.log(response.Status);
          console.log(response.Details);
        }
      });
    }
  };

  const searchUsers = ({item}) => {
    return (
      <UserRepresenter
        userId={item.UserID}
        userFirstName={item.FirstName}
        userLastName={item.LastName}
        userLogin={item.Login}
        backgroundColor="#F5F5F5"
        userPressed={userToAddPressed}></UserRepresenter>
    );
  };

  const addedUsers = ({item}) => {
    return (
      <UserRepresenter
        userId={item.UserID}
        userFirstName={item.FirstName}
        userLastName={item.LastName}
        userLogin={item.Login}
        backgroundColor="#F5F5F5"
        userPressed={userAddedPressed}></UserRepresenter>
    );
  };

  const userToAddPressed = (userId, userName) => {
    let user = resultUsers.find((x) => x.UserID == userId);

    setChatUsers([...chatUsers, user]);
    let all = resultUsers;
    console.log(userId);
    all = all.filter((x) => x.UserID != userId);
    console.log(all);
    setResultUsers(all);
    setRerenderToAddFlag(!rerenderToAddFlag);
  };

  const userAddedPressed = (userId, userName) => {
    let users = chatUsers;
    users = users.filter((x) => x.UserID != userId);
    setChatUsers(users);
    setRerenderMembersFlag(!rerenderMembersFlag);
    //setSearchField(searchField.substr(0, searchField.length))
    // setRerenderToAddFlag(!rerenderToAddFlag);
    // setRerenderMembersFlag(!rerenderMembersFlag);
  };

  const mainElement = [
    <View key={0}>
      <Button
        containerStyle={{width: 100, position: 'absolute', right: 10, top: 10}}
        title="Create"
        onPress={createButtonPressed}
        disabled={!canCreate}
      />
      <FontAwesomeIcon icon={faUsers} size={120} style={styles.groupChatIcon} />
      <Input placeholder="Chat name" onChangeText={setChatName} />
      <Card containerStyle={{width: '100%', margin: 0, paddingTop: 5}}>
        <Card.Title style={{fontSize: 18, marginBottom: 5}}>Members  <FontAwesomeIcon icon={faUserCheck} size={20} style={{}} /></Card.Title>
        <Card.Divider></Card.Divider>
        {chatUsers.length == 0 ? (
          <Text style={{color: "#A9A9A9", paddingTop: 10, paddingBottom: 10}}>Add members of this chat</Text>
        ) : (
          <FlatList
            listKey={1}
            style={styles.usersThread}
            data={chatUsers}
            renderItem={addedUsers}
            extraData={rerenderMembersFlag}
            keyExtractor={(item) => item.UserID}></FlatList>
        )}
      </Card>
      <Card containerStyle={{width: '100%', minHeight: 500, margin: 0, paddingTop: 5}}>
        <Card.Title style={{fontSize: 18, marginBottom: 5}}>
          Find users  <FontAwesomeIcon icon={faUserPlus} size={20} style={{}} />
        </Card.Title>
        <Card.Divider></Card.Divider>
        <SearchBar
          style={styles.searchField}
          containerStyle={{
            backgroundColor: '#fff',
            borderBottomWidth: 0,
            borderTopWidth: 0,
          }}
          placeholder="Enter user login or name"
          onChangeText={setSearchField}
          value={searchField}
          showLoading={loading}
          lightTheme={true}
          round={true}
          loadingProps={{
            animating: true,
            color: 'black',
          }}></SearchBar>
        <FlatList
          listKey={2}
          style={styles.usersThread}
          data={resultUsers}
          renderItem={searchUsers}
          keyExtractor={(item) => item.UserID}
          extraData={rerenderToAddFlag}></FlatList>
      </Card>
    </View>,
  ];

  const mainElementList = (item) => {
    return mainElement;
  };

  return (
    <View>
      <FlatList
        style={styles.mainList}
        data={[0]}
        renderItem={mainElementList}
        keyExtractor={(item) => '0'}></FlatList>
    </View>
  );
};

const styles = StyleSheet.create({
  groupChatIcon: {
    alignSelf: 'center',
  },
  searchField: {
    alignSelf: 'center',
    width: '90%',
  },
});

const mapStateToProps = (state) => {
  const {connectionReducer, localDBReducer} = state;
  return {
    connectionReducer,
    localDBReducer,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      connectToServer,
      sendDataToServer,
      subscribeToUpdate,
      loadDB,
      saveDocToDB,
      loadDocFromDB,
      removeDocFromDB,
      addOneToArray,
      addManyToArray,
      removeFromArray,
      getProjected,
      updateValue,
    },
    dispatch,
  );

const ConnectedCreateGroupChatScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateGroupChatScreen);

export default ConnectedCreateGroupChatScreen;
