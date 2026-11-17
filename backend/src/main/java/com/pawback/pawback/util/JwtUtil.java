package com.pawback.pawback.util;

import com.pawback.pawback.model.User;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

// Utility class for generating and parsing JWT tokens for authenticated users
@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    // Generates a signed JWT token containing subject email, userId, and role
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("version", user.getTokenVersion())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    // Extracts the email (subject claim) from a signed JWT token
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Returns true if the token can be parsed with the correct key and is not expired.
    // Any JwtException (expired, malformed, wrong signature) returns false.
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    public boolean isTokenValidForUser(String token, User user) {
        try {
            var claims=Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            Number version=claims.get("version",Number.class);
            Number id=claims.get("userId",Number.class);
            return user.isEnabled() && user.getEmail().equals(claims.getSubject()) && id!=null && user.getId()==id.longValue()
                    && user.getTokenVersion()==(version==null?0:version.longValue());
        } catch(JwtException|IllegalArgumentException exception){return false;}
    }
}
