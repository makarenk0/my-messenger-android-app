import React, {useState, useEffect} from 'react';
import {Overlay, SearchBar} from 'react-native-elements';
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
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {faUsersCog} from '@fortawesome/free-solid-svg-icons';
import {faUserTimes} from '@fortawesome/free-solid-svg-icons';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {SEARCH_USERS_WAIT_TIMEOUT} from '../../configs';

import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
} from '../../actions/ConnectionActions';
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
        userPressed={() => {userToAddPressed(item.UserId)}}></UserRepresenter>
    );
  };

  const chatMembersItem = ({item}) => {
    return (
      <UserRepresenter
        userId={item.UserId}
        userFirstName={item.FirstName}
        userLastName={item.LastName}
        userLogin={item.Login}
        backgroundColor="#F5F5F5"
        userPressed={() => {
          setSelectedMember(item.UserId);
          setModalVisible(true);
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
          props.setChatTabVisibility(false)
      } else {
        console.log(response);
      }
    });

    users = users.filter((x) => x.UserId != userId);
    setChatMembers(users);
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
    props.sendDataToServer("p", true, sendObj, (response) => {
      if (response.Status === "success") {
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
                <TouchableOpacity style={styles.makeAdminButton}>
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
        style={{height: 250}}
        data={resultUsers}
        renderItem={searchUsers}
        keyExtractor={(item) => item.UserId}></FlatList>
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
});

const mapStateToProps = (state) => {
  const {connectionReducer} = state;
  return {
    connectionReducer,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      connectToServer,
      sendDataToServer,
      subscribeToUpdate,
    },
    dispatch,
  );

const ConnectedGroupChatPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GroupChatPanel);

export default ConnectedGroupChatPanel;
