package com.pawback.pawback.security.oauth2;

import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import java.io.IOException;

@Component @RequiredArgsConstructor
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {
    private final HttpCookieOAuth2AuthorizationRequestRepository repository;
    @Value("${app.oauth2.authorizedRedirectUris:http://localhost:5173/oauth2/redirect}") private String redirect;
    @Override public void onAuthenticationFailure(HttpServletRequest request,HttpServletResponse response,AuthenticationException exception) throws IOException {
        repository.removeAuthorizationRequestCookies(request,response);
        String error="account_disabled".equals(exception.getMessage())?"account_disabled":"google_sign_in_failed";
        response.setHeader("Cache-Control","no-store");
        getRedirectStrategy().sendRedirect(request,response,UriComponentsBuilder.fromUriString(redirect).queryParam("error",error).build().toUriString());
    }
}
