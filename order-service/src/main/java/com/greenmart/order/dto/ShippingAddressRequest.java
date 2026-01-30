package com.greenmart.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddressRequest {
    private String street;
    private String city;
    private String zip;
    private String country;
}
