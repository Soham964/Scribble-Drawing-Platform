package com.scribble.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestTemplate;

/**
 * Pings the server's own health endpoint every 10 minutes
 * to prevent Render free tier from spinning down.
 */
@Configuration
@EnableScheduling
public class KeepAliveConfig {

    @Value("${app.base-url:}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Every 10 minutes
    @Scheduled(fixedDelay = 600_000, initialDelay = 60_000)
    public void keepAlive() {
        if (baseUrl == null || baseUrl.isBlank()) return;
        try {
            restTemplate.getForObject(baseUrl + "/api/health", String.class);
            System.out.println("[KeepAlive] Pinged " + baseUrl);
        } catch (Exception e) {
            System.out.println("[KeepAlive] Ping failed: " + e.getMessage());
        }
    }
}
