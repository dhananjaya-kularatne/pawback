package com.pawback.pawback.exception;

public class TooManyReportsException extends RuntimeException {
    private final int retryAfterSeconds;
    public TooManyReportsException(int retryAfterSeconds) {
        super("Too many reports. Please wait before submitting another report.");
        this.retryAfterSeconds=retryAfterSeconds;
    }
    public int getRetryAfterSeconds() { return retryAfterSeconds; }
}
