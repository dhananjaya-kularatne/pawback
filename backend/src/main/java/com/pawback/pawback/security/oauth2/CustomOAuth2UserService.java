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
        if (!"google".equals(oAuth2UserRequest.getClientRegistration().getRegistrationId())) throw new OAuth2AuthenticationException("unsupported_provider");
        String email=oAuth2User.getAttribute("email");
        String providerId=oAuth2User.getAttribute("sub");
        if(!StringUtils.hasText(email) || !StringUtils.hasText(providerId) || !Boolean.TRUE.equals(oAuth2User.getAttribute("email_verified")))
            throw new OAuth2AuthenticationException("verified_identity_required");
        email=email.trim().toLowerCase(java.util.Locale.ROOT);
        Optional<User> existing=userRepository.findByEmail(email);
        User user;
        if(existing.isPresent()) {
            user=existing.get();
            if(!user.isEnabled()) throw new OAuth2AuthenticationException("account_disabled");
            // Local accounts must keep their original sign-in method; implicit linking is forbidden.
            if(user.getProvider()==AuthProvider.LOCAL) throw new OAuth2AuthenticationException("password_account");
            if(user.getProvider()!=AuthProvider.GOOGLE || !providerId.equals(user.getProviderId()))
                throw new OAuth2AuthenticationException("identity_conflict");
        } else {
            if(userRepository.existsByProviderAndProviderId(AuthProvider.GOOGLE,providerId)) throw new OAuth2AuthenticationException("identity_conflict");
            user=userRepository.save(User.builder().email(email).name(oAuth2User.getAttribute("name"))
                    .provider(AuthProvider.GOOGLE).providerId(providerId).enabled(true).build());
        }

        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }
}
