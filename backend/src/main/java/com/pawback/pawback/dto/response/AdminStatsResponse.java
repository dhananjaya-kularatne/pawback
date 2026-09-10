package com.pawback.pawback.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * Headline counts for the admin console — enough to render the summary tiles
 * without pulling the full user or pet lists. Every field is computed live from
 * a repository count on each request, so a refresh always reflects current data.
 */
@Getter
@Builder
public class AdminStatsResponse {

    private final long totalUsers;
    private final long activeUsers;
    private final long disabledUsers;
    private final long admins;
    private final long totalPets;
    private final long totalReports;
    private final long lostPets;
}
