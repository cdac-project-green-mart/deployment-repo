package com.greenmart.checkout.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Value("${webclient.timeout.read:10000}")
    private int readTimeout;

    @Value("${service.order.url}")
    private String orderServiceUrl;

    @Value("${service.inventory.url}")
    private String inventoryServiceUrl;

    @Value("${service.payment.url}")
    private String paymentServiceUrl;

    private WebClient.Builder createBaseBuilder() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(readTimeout));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient));
    }

    @Bean
    public WebClient orderServiceClient() {
        return createBaseBuilder().baseUrl(orderServiceUrl).build();
    }

    @Bean
    public WebClient inventoryServiceClient() {
        return createBaseBuilder().baseUrl(inventoryServiceUrl).build();
    }

    @Bean
    public WebClient paymentServiceClient() {
        return createBaseBuilder().baseUrl(paymentServiceUrl).build();
    }
}
