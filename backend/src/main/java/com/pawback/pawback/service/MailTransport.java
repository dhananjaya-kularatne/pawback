package com.pawback.pawback.service;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import java.util.*;
@Component
public class MailTransport {
    private final String key,sender,name;
    private final RestTemplate http;
    public MailTransport(@Value("${brevo.api.key:}") String key,@Value("${brevo.sender.email:}") String sender,
            @Value("${brevo.sender.name:PawBack}") String name,@Value("${app.mail.required:false}") boolean required){
        this.key=key;this.sender=sender;this.name=name;
        if((required || !key.isBlank()) && (key.isBlank() || sender.isBlank() || name.isBlank())) throw new IllegalStateException("Mail requires an API key and verified sender configuration");
        SimpleClientHttpRequestFactory factory=new SimpleClientHttpRequestFactory();factory.setConnectTimeout(5000);factory.setReadTimeout(10000);http=new RestTemplate(factory);
    }
    public boolean configured(){return !key.isBlank() && !sender.isBlank();}
    public void send(String recipient,String subject,String html,String deliveryKey){
        if(!configured())throw new IllegalStateException("Mail is not configured");
        HttpHeaders headers=new HttpHeaders();headers.set("api-key",key);headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String,Object> body=Map.of("sender",Map.of("name",name,"email",sender),"to",List.of(Map.of("email",recipient)),
                "subject",subject,"htmlContent",html,"headers",Map.of("idempotencyKey",deliveryKey));
        http.exchange("https://api.brevo.com/v3/smtp/email",HttpMethod.POST,new HttpEntity<>(body,headers),String.class);
    }
}
