package com.pawback.pawback.service;

import com.pawback.pawback.model.ScanReport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
public class NotificationFormattingService {
    private final String dashboardUrl;

    public NotificationFormattingService(@Value("${app.frontend-url}") String frontendUrl) {
        this.dashboardUrl = frontendUrl.replaceAll("/+$", "") + "/dashboard";
    }

    public String buildReportNotificationSubject(String petName) {
        return "Finder report for " + petName.replaceAll("[\\r\\n]", " ");
    }

    public String buildReportNotificationHtml(ScanReport report) {
        return buildReportNotificationHtml(report.getPet().getName());
    }

    public String buildReportNotificationHtml(String petName) {
        return """
                <html><body>
                <h2>New finder report</h2>
                <p>Someone submitted a report for <strong>%s</strong>.</p>
                <p><a href="%s">View reports on PawBack</a></p>
                <p>Sign in, open My pets, and choose View reports for your pet.</p>
                </body></html>
                """.formatted(HtmlUtils.htmlEscape(petName), HtmlUtils.htmlEscape(dashboardUrl));
    }
}
