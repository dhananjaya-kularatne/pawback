package com.pawback.pawback.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

// Request body for a finder submitting a scan report — message required, photo/location handled separately since this arrives as multipart
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReportRequest {

    @NotBlank(message = "Message is required")
    private String message;

    private Double latitude;
    private Double longitude;
}