import {combineReducers} from 'redux';
import TcpSocket from 'react-native-tcp-socket';
import {NativeModules} from 'react-native'
const { EncryptionModule } = NativeModules;

const INITIAL_STATE = {
  current: {},
  possible: {},
};

var onReceiveCallbacks = []

const connectionReducer = (state = INITIAL_STATE, action) => {
  const {current, possible} = state;
  
  switch (action.type) {
    case 'CONNECT':
      
      console.log("Trying to connect")
      var establishedConnection = TcpSocket.createConnection(
        action.payload,
        () => {},
      );

      current['establishedConnection'] = establishedConnection;
      const newState = {current, possible};
      
      current.establishedConnection.on('data', function (data) {
            var result = "";
            for (var i = 0; i < data.length; i++) {       
                result += String.fromCharCode(parseInt(data[i]));
            }
            EncryptionModule.disassemblePacketFromReact(result, (disassembled) => {
                let onReceive = onReceiveCallbacks.pop()
                onReceive(disassembled)
            })
      });
      
      return newState;

    case 'DIFFIE_HELLMAN':
        
        EncryptionModule.generateKeyPair((packetToSend) => {
            current.establishedConnection.write(packetToSend)
            onReceiveCallbacks.unshift((data) => {
              let dataJSON = JSON.parse(data)
              EncryptionModule.generateDerivedKey(dataJSON.Public_key, (derivedKey) => {
                console.log("Derived key:")
                console.log(derivedKey)
              })}
            )
        })
        return state

    case 'SEND_RECEIVE_DATA':
        EncryptionModule.encryptMessage(action.payload.packetType, action.payload.packetPayload, (packetToSend) => {
            current.establishedConnection.write(packetToSend)
            onReceiveCallbacks.unshift(action.payload.callback)
        })
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