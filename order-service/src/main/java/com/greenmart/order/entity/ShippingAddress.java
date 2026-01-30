package com.greenmart.order.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "shipping_addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @Column(length = 255)
    private String street;

    @Column(length = 100)
    private String city;

    @Column(length = 20)
    private String zip;

    @Column(length = 100)
    private String country;
}
