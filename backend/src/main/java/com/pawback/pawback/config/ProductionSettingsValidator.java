package com.pawback.pawback.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.*;
import org.springframework.core.env.Environment;
import java.net.URI;
import java.nio.charset.StandardCharsets;

@Configuration @Profile("prod")
public class ProductionSettingsValidator {
    @Bean ApplicationRunner validateProductionSettings(Environment env) {
        return args -> {
            URI frontend = httpsOrigin(env.getRequiredProperty("app.frontend-url"));
            if (env.getProperty("spring.datasource.hikari.maximum-pool-size", Integer.class, 30)
                    < env.getProperty("server.tomcat.threads.max", Integer.class, 20) + 3) {
                throw new IllegalStateException("Database pool must reserve connections beyond request threads for asset recovery transactions");
            }
            for (String origin : env.getRequiredProperty("app.cors.allowed-origins").split(",")) httpsOrigin(origin.trim());
            URI callback = URI.create(env.getRequiredProperty("app.oauth2.authorizedRedirectUris"));
            if (!"https".equals(callback.getScheme()) || !frontend.getAuthority().equals(callback.getAuthority())
                    || !"/oauth2/redirect".equals(callback.getPath()) || callback.getQuery() != null || callback.getFragment() != null) {
                throw new IllegalStateException("Production OAuth redirect must be the frontend HTTPS origin followed by /oauth2/redirect");
            }
            String backendCallback = env.getRequiredProperty("spring.security.oauth2.client.registration.google.redirect-uri");
            if (!backendCallback.endsWith("/login/oauth2/code/google")) throw new IllegalStateException("Invalid Google callback path");
            httpsOrigin(backendCallback.substring(0, backendCallback.length() - "/login/oauth2/code/google".length()));
            if (env.getRequiredProperty("jwt.secret").getBytes(StandardCharsets.UTF_8).length < 64) throw new IllegalStateException("Production JWT_SECRET must contain at least 64 bytes");
            for (String key : new String[]{"brevo.api.key", "brevo.sender.email", "cloudinary.cloud-name", "cloudinary.api-key", "cloudinary.api-secret"}) {
                if (env.getRequiredProperty(key).isBlank()) throw new IllegalStateException("Missing production setting: " + key);
            }
        };
    }
    private URI httpsOrigin(String value) {
        URI uri = URI.create(value);
        if (!"https".equals(uri.getScheme()) || uri.getHost() == null || uri.getHost().equals("localhost") || uri.getHost().startsWith("127.") || uri.getHost().equals("[::1]")
                || uri.getUserInfo() != null || !uri.getPath().isEmpty() || uri.getQuery() != null || uri.getFragment() != null) {
            throw new IllegalStateException("Production origins require HTTPS, a real hostname, and no path or trailing slash");
        }
        return uri;
    }
}
