package com.pawback.pawback.config;

import com.pawback.pawback.interceptor.LoginRateLimitInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final LoginRateLimitInterceptor loginRateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Register rate limiter specifically on the login endpoint
        registry.addInterceptor(loginRateLimitInterceptor)
                .addPathPatterns("/api/auth/login");
    }
}
