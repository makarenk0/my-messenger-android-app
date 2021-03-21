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

export const subscribeToUpdate = (packetType, callback) => (
  {
    type: 'SUBSCRIBE_FOR_SERVER_EVENTS',
    payload: {'packetType': packetType, 'callback': callback}
  }
);

export const setSessionToken = (token) => (
  {
    type: 'SET_SESSION_TOKEN',
    payload: token
  }
);
