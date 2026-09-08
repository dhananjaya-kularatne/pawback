package com.pawback.pawback.exception;

// Thrown when a user whose account has been disabled by an admin tries to authenticate. Kept separate from InvalidCredentialsException so the caller
// gets a clear "account disabled" message rather than a generic login failure.
public class DisabledAccountException extends RuntimeException {
    public DisabledAccountException(String message) {
        super(message);
    }
}
