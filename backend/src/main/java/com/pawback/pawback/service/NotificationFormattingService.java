package com.pawback.pawback.service;

import com.pawback.pawback.model.ScanReport;
import org.springframework.stereotype.Service;

@Service
public class NotificationFormattingService {

    public String buildReportNotificationSubject(String petName) {
        return "Someone found " + petName + "!";
    }

    public String buildReportNotificationHtml(ScanReport report) {
        StringBuilder html = new StringBuilder();
        
        html.append("<html><body>");
        html.append("<h2>A Finder Submitted a Report!</h2>");
        html.append("<p>Good news! Someone scanned the QR code for <strong>")
            .append(report.getPet().getName())
            .append("</strong> and submitted a report.</p>");
            
        if (report.getMessage() != null && !report.getMessage().isBlank()) {
            html.append("<h3>Message from Finder:</h3>");
            html.append("<p><em>\"").append(report.getMessage()).append("\"</em></p>");
        }

        if (report.getPhotoUrl() != null && !report.getPhotoUrl().isBlank()) {
            html.append("<h3>Photo:</h3>");
            html.append("<p><img src=\"").append(report.getPhotoUrl())
                .append("\" alt=\"Found Pet\" style=\"max-width: 100%; height: auto; border-radius: 8px;\"/></p>");
        }

        if (report.getLatitude() != null && report.getLongitude() != null) {
            String mapUrl = "https://www.google.com/maps/search/?api=1&query=" + report.getLatitude() + "," + report.getLongitude();
            html.append("<h3>Location:</h3>");
            html.append("<p><a href=\"").append(mapUrl).append("\" target=\"_blank\">View Location on Google Maps</a></p>");
        }

        html.append("<p>Please log in to your PawBack dashboard immediately to check the report details.</p>");
        html.append("</body></html>");

        return html.toString();
    }
}
