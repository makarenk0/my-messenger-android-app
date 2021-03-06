package com.testappandroidstudio;
import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.security.spec.KeySpec;
import java.util.Base64;

public class AesBase64Wrapper {
    // SHOULD GENERATE EACH MESSAGE AND TRANSFER WITH PACKET!!!
    private static String IV = "IV_VALUE_16_BYTE";
    private static String SALT = "SALT_VALUE";


    private static int _AESKeyLength;
    public static int get_AESKeyLength() {
        return _AESKeyLength;
    }

    public static void set_AESKeyLength(int _AESKeyLength) {
        AesBase64Wrapper._AESKeyLength = _AESKeyLength;
    }



    private static int _AESIterationsNum;
    public static int get_AESIterationsNum() {
        return _AESIterationsNum;
    }

    public static void set_AESIterationsNum(int _AESIterationsNum) {
        AesBase64Wrapper._AESIterationsNum = _AESIterationsNum;
    }


    private static byte[] _derivedKey;
    public static byte[] get_derivedKey() {
        return _derivedKey;
    }

    public static void set_derivedKey(byte[] _derivedKey) {
        Log.d("testappandroidstudio", String.format("Derived Key length: %d", _derivedKey.length));
        AesBase64Wrapper._derivedKey = _derivedKey;
    }




    @RequiresApi(api = Build.VERSION_CODES.O)
    public String encryptAndEncode(String raw) {
        try {
            Cipher c = getCipher(Cipher.ENCRYPT_MODE);
            byte[] encryptedVal = c.doFinal(getBytes(raw));
            String s = getString(Base64.getEncoder().encode(encryptedVal));
            return s;
        } catch (Throwable t) {
            Log.d("testappandroidstudio", "There was an exception");
            throw new RuntimeException(t);
        }

    }
    @RequiresApi(api = Build.VERSION_CODES.O)
    public String decodeAndDecrypt(String encrypted) throws Exception {
        byte[] decodedValue = Base64.getDecoder().decode(getBytes(encrypted));
        Cipher c = getCipher(Cipher.DECRYPT_MODE);
        byte[] decValue = c.doFinal(decodedValue);
        return new String(decValue);
    }

    private String getString(byte[] bytes) throws UnsupportedEncodingException {
        return new String(bytes, StandardCharsets.UTF_8);
    }

    private byte[] getBytes(String str) throws UnsupportedEncodingException {
        return str.getBytes(StandardCharsets.UTF_8);
    }

    private Cipher getCipher(int mode) throws Exception {
        Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");
        byte[] iv = getBytes(IV);
        c.init(mode, generateKey(), new IvParameterSpec(iv));
        return c;
    }

    private Key generateKey() throws Exception {
        byte[] salt = getBytes(SALT);
        Log.d("testappandroidstudio", "Before custom generate key");
        byte[] encoded = GenerateKey(_derivedKey, _derivedKey.length, salt, salt.length, _AESIterationsNum, _AESKeyLength/8);
        Log.d("testappandroidstudio", "Before SecretKeySpec");
        return new SecretKeySpec(encoded, "AES");
    }
    public byte[] GenerateKey(final byte[] masterPassword, int masterPasswordLen,
                            final byte[] salt, int saltLen,
                            int iterationCount, int requestedKeyLen) {

        byte[] masterPasswordInternal = new byte[masterPasswordLen];
        System.arraycopy(masterPassword, 0, masterPasswordInternal, 0, masterPasswordLen);
        byte[] saltInternal = new byte[saltLen];
        System.arraycopy(salt, 0, saltInternal, 0, saltLen);


        SecretKeySpec keyspec = new SecretKeySpec(masterPasswordInternal, "HmacSHA1");
        Mac prf = null;
        try {
            prf = Mac.getInstance("HmacSHA1");
            prf.init(keyspec);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            e.printStackTrace();
        }

        int hLen = prf.getMacLength();   // 20 for SHA1
        int l = Math.max(requestedKeyLen, hLen); //  1 for 128bit (16-byte) keys
        int r = requestedKeyLen - (l - 1) * hLen;      // 16 for 128bit (16-byte) keys
        byte T[] = new byte[l * hLen];
        int ti_offset = 0;
        for (int i = 1; i <= l; i++) {
            F(T, ti_offset, prf, saltInternal, iterationCount, i);
            ti_offset += hLen;
        }

        byte[] generatedKey = new byte[requestedKeyLen];
        System.arraycopy(T, 0, generatedKey, 0, requestedKeyLen);
        return generatedKey;
    }

    private void F(byte[] dest, int offset, Mac prf, byte[] S, int c, int blockIndex) {
        final int hLen = prf.getMacLength();
        byte U_r[] = new byte[hLen];
        // U0 = S || INT (i);
        byte U_i[] = new byte[S.length + 4];
        System.arraycopy(S, 0, U_i, 0, S.length);
        INT(U_i, S.length, blockIndex);
        for (int i = 0; i < c; i++) {
            U_i = prf.doFinal(U_i);
            xor(U_r, U_i);
        }

        System.arraycopy(U_r, 0, dest, offset, hLen);
    }

    private void xor(byte[] dest, byte[] src) {
        for (int i = 0; i < dest.length; i++) {
            dest[i] ^= src[i];
        }
    }

    private void INT(byte[] dest, int offset, int i) {
        dest[offset + 0] = (byte) (i / (256 * 256 * 256));
        dest[offset + 1] = (byte) (i / (256 * 256));
        dest[offset + 2] = (byte) (i / (256));
        dest[offset + 3] = (byte) (i);
    }
}
