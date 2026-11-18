package com.pawback.pawback.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import lombok.*;

// Request body for a finder submitting a scan report — message required, photo/location handled separately since this arrives as multipart
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReportRequest {

    @NotBlank(message = "Message is required")
    @Size(max = 255, message = "Message must be 255 characters or fewer")
    private String message;

    @Size(max = 32, message = "Phone number must be 32 characters or fewer")
    @Pattern(regexp = "^$|^\\+?[0-9() .-]{7,32}$", message = "Enter a valid contact number using digits, spaces, +, -, or parentheses")
    private String finderPhone;

    @AssertTrue(message = "Contact number must contain between 7 and 15 digits")
    public boolean isFinderPhoneValid() {
        if (finderPhone == null || finderPhone.isBlank()) return true;
        long digits = finderPhone.chars().filter(c -> c >= '0' && c <= '9').count();
        return digits >= 7 && digits <= 15;
    }

    @DecimalMin(value = "-90", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90", message = "Latitude must be between -90 and 90")
    private Double latitude;
    @DecimalMin(value = "-180", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @AssertTrue(message = "Latitude and longitude must be provided together")
    public boolean isLocationComplete() {
        return (latitude == null) == (longitude == null);
    }
}
