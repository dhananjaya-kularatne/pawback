package com.pawback.pawback.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

/**
 * A scan report as seen by the admin moderation view: the report itself plus
 * enough about the pet it belongs to (name, uuid) that an admin can identify it
 * without a separate lookup.
 */
@Getter
@Builder
public class AdminScanReportResponse {

    private final Long id;
    private final String message;
    private final String photoUrl;
    private final Double latitude;
    private final Double longitude;
    private final Instant createdAt;
    private final Long petId;
    private final String petName;
    private final UUID petUuid;
}
