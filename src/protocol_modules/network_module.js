
import {NativeModules} from 'react-native'
const { EncryptionModule } = NativeModules;

export function sendPacketToServer(packetType, connection){
    console.log("Trying to send packet")
    switch(packetType){
        case "InitDiffieHellman":
            InitDiffieHellman(connection)
            break;
    }
    
}

export function receivePacketFromServer(data){
    //var parsedData = JSON.parse(data);

    //console.log(data[])
    console.log("Server public key")
    console.log(data.substr(16, data.length-18));
   
    const serverPublicKey = data.substr(16, data.length-18)

    EncryptionModule.generateDerivedKey(serverPublicKey, (derived) => {
        console.log("Derived: ")
        console.log(derived)
    })
}

function bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
      result += String.fromCharCode(parseInt(array[i], 2));
    }
    return result;
  }


function InitDiffieHellman(connection){
    
    EncryptionModule.generateKeyPair((publicKey) => {
        console.log("Client public key: ")
        console.log(publicKey)
        let packetWithPublicKey = {
            Public_key: publicKey
        }
        connection.write(assemblePacket(0, JSON.stringify(packetWithPublicKey)))
    })
}


function assemblePacket(type, data){
    var arr = []
    arr.push(type)

    for(var i = 0; i < data.length; i++) {
        arr.push(data.charCodeAt(i))
    }

    arr.push(87)
    arr.push(79)
    arr.push(69)
    arr.push(77)
    return arr
}