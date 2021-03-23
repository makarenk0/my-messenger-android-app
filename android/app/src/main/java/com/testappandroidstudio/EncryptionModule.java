
package com.testappandroidstudio;
import android.os.Build;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import javax.crypto.KeyAgreement;
import java.nio.ByteBuffer;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import static java.lang.String.format;

public class EncryptionModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    EncryptionModule (ReactApplicationContext context) {
        super(context);
        reactContext = context;
        _networkBuffer = new StringBuilder();
    }

    @Override
    public String getName() {
        return "EncryptionModule";
    }


    private KeyPair _myKeyPair;
    private StringBuilder _networkBuffer;
    private static final byte _magicSequence = 0x7E;


    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod//(isBlockingSynchronousMethod = true)
    public void generateKeyPair(Callback callBack) throws NoSuchAlgorithmException, InvalidKeyException, InvalidKeySpecException, NoSuchProviderException {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
        kpg.initialize(256);
        _myKeyPair = kpg.generateKeyPair();
        byte[] ourPublicKey = _myKeyPair.getPublic().getEncoded();
        byte[] ourPrivateKey = _myKeyPair.getPublic().getEncoded();

        byte[] ourPublicKeyBase64 = Base64.getEncoder().encode(ourPublicKey);
        byte[] ourPrivateKeyBase64 = Base64.getEncoder().encode(ourPrivateKey);


        byte[] result = pureAssemble('0', String.format("{\"Public_key\": \"%s\"}", new String(ourPublicKeyBase64)));
        String output = new String(result);

        callBack.invoke(output);
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod//(isBlockingSynchronousMethod = true)
    public void generateDerivedKey(String serverPublicKey, int aesIterationNum, int aesKeyLength, Callback callBack) throws NoSuchAlgorithmException, InvalidKeyException, InvalidKeySpecException, NoSuchProviderException {
        KeyFactory kf = KeyFactory.getInstance("EC");

        byte[] serverPublicKeyDecodedBase64 = Base64.getDecoder().decode(serverPublicKey);
        X509EncodedKeySpec pkSpec = new X509EncodedKeySpec(serverPublicKeyDecodedBase64);
        PublicKey otherPublicKey = kf.generatePublic(pkSpec);

        // Perform key agreement
        KeyAgreement ka = KeyAgreement.getInstance("ECDH");
        ka.init(_myKeyPair.getPrivate());
        ka.doPhase(otherPublicKey, true);

        // Read shared secret
        byte[] sharedSecret = ka.generateSecret();

        MessageDigest hash = MessageDigest.getInstance("SHA-256");
        hash.update(sharedSecret);
        byte[] derivedKey = hash.digest();

        //Configuring Aes module
        AesBase64Wrapper.set_derivedKey(derivedKey); // setting derived key to aes encryption module
        AesBase64Wrapper.set_AESIterationsNum(aesIterationNum); // setting iterations number of aes algorithm
        AesBase64Wrapper.set_AESKeyLength(aesKeyLength); // setting key length of aes algorithm
        //------------------------

        callBack.invoke(new String(Base64.getEncoder().encode(derivedKey)));
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod//(isBlockingSynchronousMethod = true)
    public void encryptMessage(int packetType, String payloadJSON, Callback callBack){
        byte[] result = pureAssemble((char)(packetType+'0'), payloadJSON);
        callBack.invoke(new String(result));
    }


    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod//(isBlockingSynchronousMethod = true)
    private void disassemblePacketFromReact(String data, Callback callback){
        ArrayList<String> res = disassemblePacket(data);
        for(String str : res){
            callback.invoke(str);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private ArrayList<String> disassemblePacket(String data){
        ArrayList<String> results = new ArrayList<>();
        for(int i = 0; i < data.length(); i++){
            if(data.charAt(i) == _magicSequence){
                String fullPacket = _networkBuffer.toString();
                _networkBuffer = new StringBuilder();
                byte[] payload;
                if(fullPacket.charAt(0) == '0'){  // 0 means not encrypted messages when we exchange public keys
                    payload = Base64.getDecoder().decode(fullPacket.substring(1));
                }
                else{
                    payload = decryptAES256(fullPacket.substring(1));
                }
                results.add(String.valueOf(fullPacket.charAt(0)) + new String(payload));  //packet type + encrypted payload
            }
            else{
                _networkBuffer.append(data.charAt(i));
            }
        }
        return results;
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private byte[] decryptAES256(String encryptedData){
        AesBase64Wrapper aesDecryptor = new AesBase64Wrapper();
        byte[] decrypted = null;
        try {
            decrypted = aesDecryptor.decodeAndDecrypt(encryptedData).getBytes();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return decrypted;
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private byte[] pureAssemble(char packetType, String payloadJSON){
        int index = 0;

        byte[] payloadBytes;
        if(packetType == '0'){
            payloadBytes = Base64.getEncoder().encode(payloadJSON.getBytes());
        }
        else{
            AesBase64Wrapper aesEncryptor = new AesBase64Wrapper();
            payloadBytes = aesEncryptor.encryptAndEncode(payloadJSON).getBytes();   // ENCRYPT WITH DERIVED KEY HERE
        }

        byte[] result = new byte[1 + payloadBytes.length + 1];
        result[index] = (byte)packetType;
        ++index;



        for (; index < payloadBytes.length + 1; index++)
        {
            result[index] = payloadBytes[index-1];
        }
        result[index] = _magicSequence;
        return result;
    }




    

}