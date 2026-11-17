package com.pawback.pawback.exception;
public class AuthenticationLimitException extends RuntimeException {
    private final int retryAfterSeconds;
    public AuthenticationLimitException(int seconds){super("Too many attempts. Please try again later.");retryAfterSeconds=seconds;}
    public int getRetryAfterSeconds(){return retryAfterSeconds;}
}
