package com.pawback.pawback.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
