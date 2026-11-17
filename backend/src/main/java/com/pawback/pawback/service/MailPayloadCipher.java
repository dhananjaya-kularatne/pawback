package com.pawback.pawback.service;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import javax.crypto.*;
import javax.crypto.spec.*;
import java.security.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
@Component
public class MailPayloadCipher {
    private final SecretKeySpec key;
    private final SecureRandom random=new SecureRandom();
    public MailPayloadCipher(@Value("${jwt.secret}") String secret) {
        try{key=new SecretKeySpec(MessageDigest.getInstance("SHA-256").digest(("pawback-mail-v1:"+secret).getBytes(StandardCharsets.UTF_8)),"AES");}
        catch(GeneralSecurityException exception){throw new IllegalStateException(exception);}
    }
    public String encrypt(String value){
        try{byte[] nonce=new byte[12];random.nextBytes(nonce);Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,key,new GCMParameterSpec(128,nonce));
            byte[] body=cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));byte[] all=Arrays.copyOf(nonce,nonce.length+body.length);System.arraycopy(body,0,all,nonce.length,body.length);return Base64.getEncoder().encodeToString(all);
        }catch(GeneralSecurityException exception){throw new IllegalStateException("Could not protect queued email",exception);}
    }
    public String decrypt(String value){
        try{byte[] all=Base64.getDecoder().decode(value);if(all.length<28)throw new IllegalArgumentException();Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,key,new GCMParameterSpec(128,Arrays.copyOf(all,12)));return new String(cipher.doFinal(all,12,all.length-12),StandardCharsets.UTF_8);}
        catch(GeneralSecurityException|IllegalArgumentException exception){throw new IllegalStateException("Queued email cannot be decrypted");}
    }
}
