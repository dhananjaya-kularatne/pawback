package com.pawback.pawback.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.Map;

@RestController @RequiredArgsConstructor
public class HealthController {
    private final JdbcTemplate jdbc;
    @GetMapping("/api/health")
    public Map<String, String> health() { jdbc.queryForObject("SELECT 1", Integer.class); return Map.of("status", "UP"); }
}
