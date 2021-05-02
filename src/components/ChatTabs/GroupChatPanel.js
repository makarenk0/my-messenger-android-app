import React, {useState, useEffect} from 'react';
import {Overlay, SearchBar, Button, Icon, Tooltip} from 'react-native-elements';
import UserRepresenter from './../UserRepresenter';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  ToastAndroid,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {faUsersCog} from '@fortawesome/free-solid-svg-icons';
import {faUserTimes} from '@fortawesome/free-solid-svg-icons';
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import {faTimesCircle} from '@fortawesome/free-solid-svg-icons';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {SEARCH_USERS_WAIT_TIMEOUT} from '../../configs';

import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
} from '../../actions/ConnectionActions';
import {
  removeDocFromDB,
  loadDocFromDB,
  saveDocToDB,
  updateValue,
} from '../../actions/LocalDBActions';

import {isEmptyOrSpaces} from '../Utilities';

const GroupChatPanel = (props) => {
  const [searchField, setSearchField] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMembers, setChatMembers] = useState([]);
  const [resultUsers, setResultUsers] = useState([]);
  const [userInputTimer, setUserInputTimer] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setChatMembers(props.membersInfo);
  }, [props.membersInfo]);

  useEffect(() => {
    if (userInputTimer !== '') {
      clearTimeout(userInputTimer);
    }
    setLoading(true);
    setUserInputTimer(setTimeout(requestToServer, SEARCH_USERS_WAIT_TIMEOUT));
    setResultUsers([]);
  }, [searchField, chatMembers]);

  const requestToServer = () => {
    setLoading(false);
    if (!isEmptyOrSpaces(searchField)) {
      let finUsersObj = {
        SessionToken: props.connectionReducer.connection.current.sessionToken,
        FindUsersRequest: searchField,
      };

      props.sendDataToServer('3', true, finUsersObj, (response) => {
        if (response.Status == 'success') {
          console.log(response.Users);
          let all = response.Users;
          all = all.filter(
            (x) => chatMembers.findIndex((y) => y.UserId == x.UserId) == -1,
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
        userId={item.UserId}
        userFirstName={item.FirstName}
        userLastName={item.LastName}
        userLogin={item.Login}
        backgroundColor="#F5F5F5"
        userPressed={() => {
          if (props.isAdmin) {
            userToAddPressed(item.UserId);
          }
        }}></UserRepresenter>
    );
  };

  const chatMembersItem = ({item}) => {
    return (
      <UserRepresenter
        userId={item.UserId}
        userFirstName={item.FirstName}
        userLastName={item.LastName}
        userLogin={item.Login}
        isMe={props.connectionReducer.connection.current.currentUser.UserId == item.UserId}
        backgroundColor="#F5F5F5"
        userPressed={() => {
          if(props.connectionReducer.connection.current.currentUser.UserId == item.UserId && props.isAdmin){
            ToastAndroid.show("You can't perform actions on yourself", ToastAndroid.SHORT);
          }
          else if (props.isAdmin) {
            setSelectedMember(item.UserId);
            setModalVisible(true);
          }
        }}></UserRepresenter>
    );
  };

  const kickMember = (userId) => {
    let users = chatMembers;
    let sendObj = {
      EventType: 2,
      ChatId: props.chatId,
      EventData: {
        UserId: userId,
      },
    };
    props.sendDataToServer('p', true, sendObj, (response) => {
      if (response.Status === 'success') {
        //props.setChatTabVisibility(false);
      } else {
        console.log(response);
      }
    });

    users = users.filter((x) => x.UserId != userId);
    setChatMembers(users);
  };



  const transferAdminRights = (userId) => {
    let sendObj = {
      EventType: 4,
      ChatId: props.chatId,
      EventData: {
        UserId: userId,
      },
    };
    props.sendDataToServer('p', true, sendObj, (response) => {
      if (response.Status === 'success') {
      } else {
        console.log(response);
      }
    });
    setModalVisible(false);
    props.setChatTabVisibility(false);
  };


  const leavePublicChat = () => {
    let sendObj = {
      EventType: 1,
      ChatId: props.chatId,
      EventData: {},
    };
    props.sendDataToServer("p", true, sendObj, (response) => {
      if (response.Status === "success") {
        
      } else {
        console.log(response);
      }
    });
    props.setChatTabVisibility(false)
    props.onLeaveChat();
  };

  const userToAddPressed = (userId) => {
    let user = resultUsers.find((x) => x.UserId == userId);

    let sendObj = {
      EventType: 3,
      ChatId: props.chatId,
      EventData: {
        UserId: userId,
      },
    };
    props.sendDataToServer('p', true, sendObj, (response) => {
      if (response.Status === 'success') {
      } else {
        console.log(response);
      }
    });

    setChatMembers([...chatMembers, user]);

    let all = resultUsers;
    console.log(userId);
    all = all.filter((x) => x.UserId != userId);
    console.log(all);
    setResultUsers(all);
  };

  return (
    <Overlay
      overlayStyle={styles.chatTabStyle}
      isVisible={props.chatTabVisibility}
      onBackdropPress={() => {
        props.setChatTabVisibility(false);
      }}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Pressable
              style={styles.buttonClose}
              onPress={() => setModalVisible(!modalVisible)}>
              <FontAwesomeIcon
                icon={faTimes}
                size={28}
                style={styles.sendIcon}
              />
            </Pressable>

            <View style={styles.actionButtonView}>
              <View>
                <TouchableOpacity
                  style={styles.kickButton}
                  onPress={() => {
                    kickMember(selectedMember);
                    setModalVisible(!modalVisible);
                  }}>
                  <FontAwesomeIcon
                    icon={faUserTimes}
                    size={58}
                    style={styles.sendIcon}
                  />
                </TouchableOpacity>
                <Text style={{alignSelf: 'center', paddingTop: 10}}>Kick</Text>
              </View>

              <View>
                <TouchableOpacity
                  style={styles.makeAdminButton}
                  onPress={() => {
                    transferAdminRights(selectedMember);
                  }}>
                  <FontAwesomeIcon
                    icon={faUsersCog}
                    size={58}
                    style={styles.sendIcon}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    alignSelf: 'flex-end',
                    textAlign: 'center',
                    paddingTop: 10,
                    paddingLeft: 50,
                  }}>
                  Make admin
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <Text style={{fontSize: 20, fontWeight: '800', paddingBottom: 10}}>
        Members:
      </Text>

      <FlatList
        style={{paddingBottom: 10, height: 250}}
        data={chatMembers}
        renderItem={chatMembersItem}
        keyExtractor={(item) => item.UserId}></FlatList>

      {props.isAdmin ? (
        <View>
          <Text style={{fontSize: 20, fontWeight: '800', paddingBottom: 10}}>
            Add new members:
          </Text>
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
            style={{maxHeight: 250, minHeight: 100}}
            data={resultUsers}
            renderItem={searchUsers}
            keyExtractor={(item) => item.UserId}></FlatList>
        </View>
      ) : null}
      <View style={{flexDirection: 'row'}}>
        {/* <Tooltip popover={<Text>Info here</Text>} containerStyle={{width: '45%'}}> */}
        <Button
          disabled={props.isAdmin && chatMembers.length > 1}
          title=" Leave"
          containerStyle={{width: '45%'}}
          buttonStyle={{backgroundColor: '#DC143C'}}
          icon={<FontAwesomeIcon icon={faSignOutAlt} size={20} color="#fff" />}
          onPress={() => {leavePublicChat()}}
        />
        {/* </Tooltip> */}
        <Button
          onPress={() => {
            props.setChatTabVisibility(false);
          }}
          title=" Close"
          containerStyle={{marginLeft: '10%', width: '45%'}}
          icon={<FontAwesomeIcon icon={faTimesCircle} size={20} color="#fff" />}
        />
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  chatTabStyle: {
    width: '90%',
    maxHeight: '90%',
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 300,
    height: 180,
  },
  buttonClose: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  actionButtonView: {
    flexDirection: 'row',
  },

  kickButton: {
    width: 75,
    backgroundColor: '#E5E4E2',
    padding: 8,
    borderRadius: 8,
  },
  makeAdminButton: {
    width: 75,
    marginLeft: 50,
    backgroundColor: '#E5E4E2',
    padding: 8,
    borderRadius: 8,
  },
  leaveButton: {
    backgroundColor: '#DC143C',
    width: 70,
    height: 30,
    alignSelf: 'flex-end',
  },
});

const mapStateToProps = (state) => {
  const {connectionReducer, localDBReducer} = state;
  return {
    connectionReducer,
    localDBReducer
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      connectToServer,
      sendDataToServer,
      subscribeToUpdate,
      removeDocFromDB,
      loadDocFromDB,
      saveDocToDB,
      updateValue
    },
    dispatch,
  );

const ConnectedGroupChatPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GroupChatPanel);

export default ConnectedGroupChatPanel;
