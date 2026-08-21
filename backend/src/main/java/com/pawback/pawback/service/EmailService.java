package com.pawback.pawback.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    private final String brevoApiKey;
    private final String senderEmail;
    private final String senderName;
    private final RestTemplate restTemplate;

    public EmailService(
            @Value("${brevo.api.key:}") String brevoApiKey,
            @Value("${brevo.sender.email:support@pawback.com}") String senderEmail,
            @Value("${brevo.sender.name:PawBack Support}") String senderName) {
        this.brevoApiKey = brevoApiKey;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.restTemplate = new RestTemplate();
    }

    public void sendPasswordResetOtp(String toEmail, String otp) {
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            log.warn("BREVO_API_KEY is not set. Simulating email sending. OTP for {}: {}", toEmail, otp);
            return;
        }

        String url = "https://api.brevo.com/v3/smtp/email";

        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", brevoApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        // Constructing the payload
        Map<String, Object> body = Map.of(
                "sender", Map.of("name", senderName, "email", senderEmail),
                "to", List.of(Map.of("email", toEmail)),
                "subject", "Your PawBack Password Reset Code",
                "htmlContent", "<html><body>" +
                        "<h2>Password Reset Request</h2>" +
                        "<p>Your 6-digit verification code is: <strong style='font-size: 1.5em;'>" + otp + "</strong></p>" +
                        "<p>This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>" +
                        "</body></html>"
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            log.info("Password reset OTP sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset OTP to {}", toEmail, e);
            // We log the error but don't necessarily want to leak it to the client
            // as it could break the generic "If this email is registered, we sent an OTP" response.
        }
    }
}
