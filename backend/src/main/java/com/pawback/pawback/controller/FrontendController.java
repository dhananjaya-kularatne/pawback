package com.pawback.pawback.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Serves the bundled React app when a page is opened or refreshed directly. */
@Controller
public class FrontendController {

    @GetMapping({"/", "/help", "/privacy", "/dashboard", "/admin",
            "/admin/users", "/admin/reports", "/scan/{petUuid}", "/oauth2/redirect"})
    public String page() {
        return "forward:/index.html";
    }
}
