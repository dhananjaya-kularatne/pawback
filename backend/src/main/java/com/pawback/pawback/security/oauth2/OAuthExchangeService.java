package com.pawback.pawback.security.oauth2;

import com.pawback.pawback.dto.response.*;
import com.pawback.pawback.exception.InvalidCredentialsException;
import com.pawback.pawback.model.User;
import com.pawback.pawback.repository.UserRepository;
import com.pawback.pawback.util.JwtUtil;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.security.*;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service @RequiredArgsConstructor
public class OAuthExchangeService {
    private static final String KEY=OAuthExchangeService.class.getName();
    private final UserRepository users;
    private final JwtUtil jwt;
    private final SecureRandom random=new SecureRandom();
    private record Grant(String code,Long userId,long version,long expires) {}
    public String issue(HttpServletRequest request, User user) {
        byte[] bytes=new byte[32]; random.nextBytes(bytes);
        String code=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        request.getSession(true).setAttribute(KEY,new Grant(code,user.getId(),user.getTokenVersion(),System.currentTimeMillis()+60_000));
        return code;
    }
    public AuthResponse exchange(HttpServletRequest request,String code) {
        HttpSession session=request.getSession(false);
        if(session==null || code==null || !code.matches("[A-Za-z0-9_-]{43}")) throw invalid();
        Grant grant;
        synchronized(session) {
            Object value=session.getAttribute(KEY);
            if(!(value instanceof Grant g) || g.expires()<System.currentTimeMillis()
                    || !MessageDigest.isEqual(g.code().getBytes(StandardCharsets.US_ASCII),code.getBytes(StandardCharsets.US_ASCII))) throw invalid();
            grant=g; session.removeAttribute(KEY);
        }
        User user=users.findById(grant.userId()).filter(u -> u.isEnabled() && u.getTokenVersion()==grant.version()).orElseThrow(this::invalid);
        return AuthResponse.builder().token(jwt.generateToken(user)).user(UserResponse.fromUser(user)).build();
    }
    private InvalidCredentialsException invalid(){return new InvalidCredentialsException("Google sign-in expired or invalid. Please try again.");}
}
