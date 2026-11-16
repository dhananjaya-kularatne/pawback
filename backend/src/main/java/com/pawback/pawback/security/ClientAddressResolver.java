package com.pawback.pawback.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class ClientAddressResolver {
    private final Set<String> trusted;
    public ClientAddressResolver(@Value("${app.report-limit.trusted-proxies:}") String peers) {
        trusted=new HashSet<>();
        for(String peer:peers.split(",")) if(!peer.isBlank()) trusted.add(peer.trim());
    }
    public String resolve(HttpServletRequest request) {
        String peer=request.getRemoteAddr();
        String forwarded=request.getHeader("X-Forwarded-For");
        if(!trusted.contains(peer)||forwarded==null) return peer;
        // Rightmost address is the immediate client's address when the trusted
        // edge replaces/appends the header. Never trust a caller's first value.
        String[] chain=forwarded.split(","); String candidate=chain[chain.length-1].trim();
        if(!candidate.matches("[0-9a-fA-F:.]{3,45}")) return peer;
        try {return java.net.InetAddress.getByName(candidate).getHostAddress();}
        catch(java.net.UnknownHostException exception){return peer;}
    }
}
