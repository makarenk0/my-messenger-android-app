import {combineReducers} from 'redux';
import TcpSocket from 'react-native-tcp-socket';
import {NativeModules} from 'react-native';
import {KEY_DERIVATION_ITERATIONS_NUMBER, AES_KEY_LENGTH} from '../configs';
const {EncryptionModule} = NativeModules;

const INITIAL_STATE = {
  current: {},
};

var onReceiveCallbacks = [];

const connectionReducer = (state = INITIAL_STATE, action) => {
  const {current} = state;

  switch (action.type) {
    case 'CONNECT':
      var establishedConnection = TcpSocket.createConnection(
        {port: action.payload.port, host: action.payload.host},
        (address) => {
          action.payload.onSuccessfullConnect(address);
        },
      ).on('error', () => {
        action.payload.onServerClosedConnection();
      });

      

      current['establishedConnection'] = establishedConnection;

      current.establishedConnection.on('data', function (data) {
        let result = '';
        console.log("RAW DATA")
        for (var i = 0; i < data.length; i++) {
          result += String.fromCharCode(parseInt(data[i]));
        }
        EncryptionModule.disassemblePacketFromReact(result, (disassembled) => {

          disassembled.forEach((packetWithType) =>{
            let onReceive = onReceiveCallbacks.filter(
              (x) => x.type == packetWithType.charAt(0),
            );
            console.log(onReceiveCallbacks)
            onReceive.forEach((el) => {
              if (el.disposable) {
                // if disposable use callback once and then remove object from callbacks array
                let index = onReceiveCallbacks.findIndex(
                  (x) => x.type == el.type,
                );
                let spliced = onReceiveCallbacks.splice(index, 1);
                console.log('Callback with type ' + el.type + ' was disposed');
              }
              let getObj = JSON.parse(packetWithType.slice(1));
              el.callback(getObj);
            });
          })
          



        });
      });


      current.establishedConnection.on('close', function(){
        console.log('Connection closed!');
      });
      current.establishedConnection.on('error', function(error){
        console.log("ERROR");
        console.log(error);
      });

      const newState = {current};
      return newState;

    case 'DIFFIE_HELLMAN':
      EncryptionModule.generateKeyPair((packetToSend) => {
        current.establishedConnection.write(packetToSend);
        onReceiveCallbacks.unshift({
          type: '0',
          disposable: true,
          callback: (dataJSON) => {
            EncryptionModule.generateDerivedKey(
              dataJSON.Public_key,
              KEY_DERIVATION_ITERATIONS_NUMBER,
              AES_KEY_LENGTH,
              (derivedKey) => {
                console.log('Derived key:');
                console.log(derivedKey);
                action.payload.callback('Diffie hellman established');
              },
            );
          },
        });
      });
      return state;

    case 'SEND_RECEIVE_DATA':
      console.log(action.payload.packetPayload);

      EncryptionModule.encryptMessage(
        action.payload.packetType.charCodeAt(0),
        action.payload.packetPayload,
        (packetToSend) => {
          onReceiveCallbacks.unshift({
            type: action.payload.packetType,
            disposable: action.payload.disposable,
            callback: action.payload.callback,
          });
          current.establishedConnection.write(packetToSend);
        },
      );
      return state;

    case 'SUBSCRIBE_FOR_SERVER_EVENTS':
      let alreadyPresent = onReceiveCallbacks.findIndex(x => x.id == action.payload.id)
      if(alreadyPresent != -1){ //checking if there are no callbacks with such id already
        onReceiveCallbacks[alreadyPresent].callback = action.payload.callback
      }
      else{
        onReceiveCallbacks.unshift({
          type: action.payload.packetType,
          id: action.payload.id,
          disposable: false,
          callback: action.payload.callback,
        });
      }
      return state;
    case 'UNSUBSCRIBE_FROM_SERVER_EVENTS':
      let index = onReceiveCallbacks.findIndex(
        (x) => x.id == action.payload.id,
      );
      let removed = onReceiveCallbacks.splice(index, 1);
      action.payload.callback(removed)
      console.log("onReceiveCallbacks: ")
      console.log(onReceiveCallbacks)
      return state;

    case 'SET_SESSION_TOKEN_AND_USER_INFO':
      current['sessionToken'] = action.payload.sessionToken;
      current['currentUser'] = action.payload.userInfo
      return {current};
    case 'DESTROY_CONNECTION':
      current.establishedConnection.destroy()
      action.payload.callback()
      return {current};
    default:
      return state;
  }
};

export default combineReducers({
  connection: connectionReducer,
});
// export const ConnectionReducer = combineReducers({
//   connectionReducer
// });
