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

      // establishedConnection.on('close', function(){
      //   console.log('Connection closed!');
      // });
      // establishedConnection.on('error', function(){
      //   console.log('Error');
      // });

      current['establishedConnection'] = establishedConnection;

      current.establishedConnection.on('data', function (data) {
        let result = '';
        for (var i = 0; i < data.length; i++) {
          result += String.fromCharCode(parseInt(data[i]));
        }
        EncryptionModule.disassemblePacketFromReact(result, (disassembled) => {
         

          disassembled.forEach((packetWithType) =>{
            let onReceive = onReceiveCallbacks.filter(
              (x) => x.type == packetWithType.charAt(0),
            );
            onReceive.forEach((el) => {
              if (el.disposable) {
                // if disposable use callback once and then remove object from callbacks array
                let index = onReceiveCallbacks.findIndex(
                  (x) => x.type == result.charAt(0),
                );
                onReceiveCallbacks.splice(index, 1);
                console.log('Callback with type ' + el.type + ' was disposed');
              }
              let getObj = JSON.parse(packetWithType.slice(1));
              el.callback(getObj);
            });
          })
          



        });
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
        action.payload.packetType,
        action.payload.packetPayload,
        (packetToSend) => {
          onReceiveCallbacks.unshift({
            type: String.fromCharCode(action.payload.packetType + 48),
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
          type: String.fromCharCode(action.payload.packetType + 48),
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
      return state;

    case 'SET_SESSION_TOKEN_AND_ID':
      current['sessionToken'] = action.payload.sessionToken;
      current['myId'] = action.payload.userId
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
