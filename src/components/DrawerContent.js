import { createDrawerNavigator } from '@react-navigation/drawer';
import React, {useState, useEffect} from 'react';
import { DrawerItemList, DrawerContentScrollView } from '@react-navigation/drawer';
import {
    StyleSheet,
    ScrollView,
    TextInput,
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
  } from 'react-native';


const DrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

export default DrawerContent
