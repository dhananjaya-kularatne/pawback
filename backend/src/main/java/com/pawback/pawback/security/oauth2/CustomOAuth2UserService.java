package com.pawback.pawback.security.oauth2;

import com.pawback.pawback.model.AuthProvider;
import com.pawback.pawback.model.User;
import com.pawback.pawback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            // Throwing an instance of AuthenticationException will trigger the OAuth2AuthenticationFailureHandler
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        if (!StringUtils.hasText(email)) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        String providerId = oAuth2User.getAttribute("sub"); // Google uses 'sub' as the unique ID
        String name = oAuth2User.getAttribute("name");

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Account linking: update providerId and provider if they weren't set, or just ensure it's logged in
            if (user.getProvider() == null || user.getProvider() == AuthProvider.LOCAL) {
                user.setProvider(AuthProvider.GOOGLE);
                user.setProviderId(providerId);
                user = userRepository.save(user);
            }
        } else {
            // Register new user
            user = User.builder()
                    .email(email)
                    .name(name)
                    .provider(AuthProvider.GOOGLE)
                    .providerId(providerId)
                    .enabled(true)
                    .build();
            user = userRepository.save(user);
        }

        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }
}
