package com.pawback.pawback.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
/** Authentication budgets are enforced in AuthService after request validation. */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {}
