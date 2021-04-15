export const connectToServer = (ipAddress, portNumber, onSuccessfullConnect, onServerClosedConnection) => (
    {
      type: 'CONNECT',
      payload: {'port': portNumber, 'host': ipAddress, 'onSuccessfullConnect': onSuccessfullConnect, 'onServerClosedConnection': onServerClosedConnection}
    }
  );

export const initDiffieHellman = (callback) => (
    {
      type: 'DIFFIE_HELLMAN',
      payload: {'callback': callback}
    }
);

export const sendDataToServer = (packetType, disposable, packetPayload, callback) => (
    {
      type: 'SEND_RECEIVE_DATA',
      payload: {'packetType': packetType, 'disposable': disposable, 'packetPayload': typeof packetPayload === 'string' ? packetPayload : JSON.stringify(packetPayload), 'callback': callback}
    }
);

export const subscribeToUpdate = (packetType, id, callback) => (
  {
    type: 'SUBSCRIBE_FOR_SERVER_EVENTS',
    payload: {'packetType': packetType, "id": id, 'callback': callback}
  }
);

export const unsubscribeFromUpdate = (id, callback) => (
  {
    type: 'UNSUBSCRIBE_FROM_SERVER_EVENTS',
    payload: {"id": id, 'callback': callback}
  }
);

export const setSessionTokenAndUserInfo = (token, userInfo) => (
  {
    type: 'SET_SESSION_TOKEN_AND_USER_INFO',
    payload: {"sessionToken": token, "userInfo": userInfo}
  }
);

export const destroyConnection = (callback) => (
  {
    type: 'DESTROY_CONNECTION',
    payload: {"callback": callback}
  }
);