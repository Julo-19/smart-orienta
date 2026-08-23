package com.smartorienta.orientationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class OrientationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrientationServiceApplication.class, args);
    }

}
