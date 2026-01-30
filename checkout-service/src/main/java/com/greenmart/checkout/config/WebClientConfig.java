package com.greenmart.checkout.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Value("${webclient.timeout.connect:5000}")
    private int connectTimeout;

    @Value("${webclient.timeout.read:10000}")
    private int readTimeout;

    @Bean
    public WebClient.Builder webClientBuilder() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(readTimeout));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient));
    }

    @Bean
    public WebClient orderServiceClient(
            WebClient.Builder builder,
            @Value("${service.order.url}") String orderServiceUrl) {
        return builder.baseUrl(orderServiceUrl).build();
    }

    @Bean
    public WebClient inventoryServiceClient(
            WebClient.Builder builder,
            @Value("${service.inventory.url}") String inventoryServiceUrl) {
        return builder.baseUrl(inventoryServiceUrl).build();
    }

    @Bean
    public WebClient paymentServiceClient(
            WebClient.Builder builder,
            @Value("${service.payment.url}") String paymentServiceUrl) {
        return builder.baseUrl(paymentServiceUrl).build();
    }
}
