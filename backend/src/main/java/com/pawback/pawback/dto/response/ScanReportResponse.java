package com.pawback.pawback.dto.response;

import lombok.*;

import java.time.Instant;

// Response shape for a submitted scan report
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScanReportResponse {

    private Long id;
    private String message;
    private String photoUrl;
    private Double latitude;
    private Double longitude;
    private Instant createdAt;
}