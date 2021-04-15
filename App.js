import 'react-native-gesture-handler';
import React from 'react';

import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import LogInScreen from './src/components/LogInScreen';
import SignUpScreen from './src/components/SignUpScreen';
import UserScreen from './src/components/UserScreen';
import ChatScreen from './src/components/ChatScreen';
import CreateGroupChatScreen from './src/components/CreateGroupChatScreen';
import RootModal from './src/components/Modals/RootModal';
import connectionReducer from './src/reducers/ConnectionReducer';
import localDBReducer from './src/reducers/LocalDBReducer';
import {ModalReducer} from './src/reducers/ModalReducer';

const store = createStore(
  combineReducers({connectionReducer, ModalReducer, localDBReducer}),
);

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Log In"
              component={LogInScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen name="Sign Up" component={SignUpScreen} />
            <Stack.Screen
              name="Home"
              component={UserScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ChatScreen"
              component={ChatScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="CreateGroupChatScreen"
              component={CreateGroupChatScreen}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <RootModal />
      </Provider>
    </SafeAreaProvider>
  );
}