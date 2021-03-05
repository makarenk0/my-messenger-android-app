export const connectToServer = (ipAddress, portNumber, onSuccessfullConnect, onServerClosedConnection) => (
    {
      type: 'CONNECT',
      payload: {'port': portNumber, 'host': ipAddress, 'onSuccessfullConnect': onSuccessfullConnect, 'onServerClosedConnection': onServerClosedConnection}
    }
  );

export const initDiffieHellman = () => (
    {
      type: 'DIFFIE_HELLMAN'
    }
);

export const sendDataToServer = (packetType, packetPayload, callback) => (
    {
      type: 'SEND_RECEIVE_DATA',
      payload: {'packetType': packetType, 'payload': packetPayload, 'callback': callback}
    }
);
