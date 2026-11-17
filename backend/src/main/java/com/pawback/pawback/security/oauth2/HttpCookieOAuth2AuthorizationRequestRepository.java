package com.pawback.pawback.security.oauth2;

import com.pawback.pawback.util.CookieUtils;
import jakarta.servlet.http.*;
import org.springframework.security.oauth2.client.web.*;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

/** Authorization requests stay on the server; browser cookies never contain serialized objects. */
@Component
public class HttpCookieOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {
    private final HttpSessionOAuth2AuthorizationRequestRepository delegate = new HttpSessionOAuth2AuthorizationRequestRepository();
    private static final String CREATED = HttpCookieOAuth2AuthorizationRequestRepository.class.getName()+".created";
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || !(session.getAttribute(CREATED) instanceof Long created)
                || System.currentTimeMillis()-created > 180_000) return null;
        return delegate.loadAuthorizationRequest(request);
    }
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest value, HttpServletRequest request, HttpServletResponse response) {
        if (value == null) { removeAuthorizationRequestCookies(request,response); return; }
        HttpSession session=request.getSession(true);
        session.setMaxInactiveInterval(180);
        session.setAttribute(CREATED,System.currentTimeMillis());
        delegate.saveAuthorizationRequest(value,request,response);
        CookieUtils.deleteCookie(request,response,"oauth2_auth_request");
        CookieUtils.deleteCookie(request,response,"redirect_uri");
    }
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,HttpServletResponse response) {
        OAuth2AuthorizationRequest result=loadAuthorizationRequest(request);
        if(result!=null) delegate.removeAuthorizationRequest(request,response);
        return result;
    }
    public void removeAuthorizationRequestCookies(HttpServletRequest request,HttpServletResponse response) {
        delegate.saveAuthorizationRequest(null,request,response);
        if(request.getSession(false)!=null) request.getSession(false).removeAttribute(CREATED);
        CookieUtils.deleteCookie(request,response,"oauth2_auth_request");
        CookieUtils.deleteCookie(request,response,"redirect_uri");
    }
}
