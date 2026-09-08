package com.pawback.pawback.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * Headline counts for the admin console — enough to render the summary tiles
 * without pulling the full user list.
 */
@Getter
@Builder
public class AdminStatsResponse {

    private final long totalUsers;
    private final long activeUsers;
    private final long disabledUsers;
    private final long admins;
}
