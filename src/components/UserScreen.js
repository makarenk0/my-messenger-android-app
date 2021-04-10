import {createDrawerNavigator} from '@react-navigation/drawer';
import React, {useState, useEffect} from 'react';
import HomeScreen from './HomeScreen';
import OtherUsersScreen from './OtherUsersScreen';
import ConnectedDrawerContent from './DrawerContent';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCommentDots} from '@fortawesome/free-solid-svg-icons';
import {faAddressCard} from '@fortawesome/free-solid-svg-icons';

const UserScreen = (props) => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <ConnectedDrawerContent {...props} />}
      
      drawerContentOptions={{
        activeBackgroundColor: "#b7d9f4",
        itemStyle: {
         // marginVertical: 30
        },
        labelStyle:{
          fontSize: 15,
          fontWeight: "bold",
        }
        
      }}>
      <Drawer.Screen name="Chats" component={HomeScreen} options={{drawerIcon: () =>(<FontAwesomeIcon icon={faCommentDots} size={25} />)}}/>
      <Drawer.Screen name="Contacts" component={OtherUsersScreen} options={{drawerIcon: () =>(<FontAwesomeIcon icon={faAddressCard} size={25} />), unmountOnBlur: true}} />
    </Drawer.Navigator>
  );
};

export default UserScreen;
