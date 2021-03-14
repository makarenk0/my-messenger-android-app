import {combineReducers} from 'redux';
import TcpSocket from 'react-native-tcp-socket';
import {NativeModules} from 'react-native'
import {AES_ITERATIONS_NUMBER, AES_KEY_LENGTH} from '../configs'
const { EncryptionModule } = NativeModules;

const INITIAL_STATE = {
  current: {},
};

var onReceiveCallbacks = []

const connectionReducer = (state = INITIAL_STATE, action) => {
  const {current} = state;
  
  switch (action.type) {
    case 'CONNECT':
      
  
      var establishedConnection = TcpSocket.createConnection(
        {'port': action.payload.port, 'host': action.payload.host},
        (address) => {action.payload.onSuccessfullConnect(address)}
      ).on('error', () => {action.payload.onServerClosedConnection()})
   
      
      // establishedConnection.on('close', function(){
      //   console.log('Connection closed!');
      // });
      // establishedConnection.on('error', function(){
      //   console.log('Error');
      // });

      current['establishedConnection'] = establishedConnection;
      
      
      current.establishedConnection.on('data', function (data) {
            var result = "";
            for (var i = 0; i < data.length; i++) {       
                result += String.fromCharCode(parseInt(data[i]));
            }
            EncryptionModule.disassemblePacketFromReact(result, (disassembled) => {
                let onReceive = onReceiveCallbacks.pop()
                let getObj = JSON.parse(disassembled)
                onReceive(getObj)
            })
      });
      
      const newState = {current};
      return newState;

    case 'DIFFIE_HELLMAN':
        
        EncryptionModule.generateKeyPair((packetToSend) => {
            current.establishedConnection.write(packetToSend)
            onReceiveCallbacks.unshift((dataJSON) => {
              EncryptionModule.generateDerivedKey(dataJSON.Public_key, AES_ITERATIONS_NUMBER, AES_KEY_LENGTH, (derivedKey) => {
                console.log("Derived key:")
                console.log(derivedKey)
              })}
            )
        })
        return state

    case 'SEND_RECEIVE_DATA':
      console.log(action.payload.packetPayload)
      
        EncryptionModule.encryptMessage(action.payload.packetType, action.payload.packetPayload, (packetToSend) => {
          current.establishedConnection.write(packetToSend)
          onReceiveCallbacks.unshift(action.payload.callback)
        })
      return state
    case 'SET_SESSION_TOKEN':
      current['sessionToken'] = action.payload;
      return {current}
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