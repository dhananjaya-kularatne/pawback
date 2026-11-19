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
        return "New sighting report for " + petName.replaceAll("[\\r\\n]", " ");
    }

    public String buildReportNotificationHtml(ScanReport report) {
        return buildReportNotificationHtml(report.getPet().getName());
    }

    public String buildReportNotificationHtml(String petName) {
        return layout("New sighting report", """
                <p style="margin:0 0 20px">Someone submitted a report for <strong>%s</strong>.</p>
                <p style="margin:0 0 22px"><a href="%s" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#2347b9;color:#ffffff;font-weight:bold;text-decoration:none">Open My pets</a></p>
                <p style="margin:0;color:#4b5b72">Sign in and select <strong>View reports</strong> on your pet’s card.</p>
                """.formatted(HtmlUtils.htmlEscape(petName), HtmlUtils.htmlEscape(dashboardUrl)));
    }

    public String buildPasswordResetHtml(String code) {
        return layout("Reset your password", """
                <p style="margin:0 0 16px">Enter this 6-digit code on the PawBack password reset screen.</p>
                <p style="margin:0 0 18px;padding:14px 20px;border:1px solid #dbe2ef;border-radius:8px;background:#edf1ff;color:#2347b9;font-family:Consolas,monospace;font-size:30px;font-weight:bold;letter-spacing:4px;text-align:center">%s</p>
                <p style="margin:0 0 12px">The code expires in 10 minutes. Keep it private.</p>
                <p style="margin:0;color:#4b5b72">If you didn’t request a password reset, you can ignore this email.</p>
                """.formatted(HtmlUtils.htmlEscape(code)));
    }

    private String layout(String heading, String content) {
        return """
                <!doctype html>
                <html lang="en">
                <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
                <body style="margin:0;background:#f8f6f0;color:#182743;font:16px/1.6 Arial,sans-serif">
                  <table role="presentation" style="width:100%%;border-spacing:0">
                    <tr><td align="center" style="padding:24px 12px">
                      <table role="presentation" style="width:100%%;max-width:520px;border:1px solid #dbe2ef;border-spacing:0;border-radius:14px;background:#ffffff;text-align:left;word-wrap:break-word">
                        <tr><td style="padding:24px 26px">
                          <p style="margin:0 0 16px;color:#2347b9;font-size:18px;font-weight:bold">PawBack</p>
                          <h1 style="margin:0 0 14px;font:normal 28px/1.2 Georgia,serif">%s</h1>
                          %s
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(heading, content);
    }
}
