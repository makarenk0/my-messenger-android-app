import { createDrawerNavigator } from '@react-navigation/drawer';
import React, {useState, useEffect} from 'react';
import HomeScreen from './HomeScreen'
import DrawerContent from './DrawerContent'

const UserScreen = (props) => {

    const Drawer = createDrawerNavigator();
    return(
      <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props}/>}>
          <Drawer.Screen name="HomeScreen" component={HomeScreen} />
      </Drawer.Navigator>
    )
}

export default UserScreen