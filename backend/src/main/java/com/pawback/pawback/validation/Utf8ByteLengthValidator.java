package com.pawback.pawback.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.nio.charset.StandardCharsets;

public class Utf8ByteLengthValidator implements ConstraintValidator<Utf8ByteLength, String> {
    private int maximum;
    @Override public void initialize(Utf8ByteLength constraint) { maximum = constraint.max(); }
    @Override public boolean isValid(String value, ConstraintValidatorContext context) {
        // The length guard avoids allocating a large byte array for oversized input.
        return value == null || (value.length() <= maximum
                && value.getBytes(StandardCharsets.UTF_8).length <= maximum);
    }
}
