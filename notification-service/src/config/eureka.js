const Eureka = require('eureka-js-client').Eureka;

const eurekaClient = new Eureka({
    instance: {
        app: 'notification-service',
        instanceId: `notification-service:${process.env.PORT || 8089}`,
        hostName: process.env.EUREKA_HOST || 'localhost',
        ipAddr: process.env.EUREKA_HOST || 'localhost',
        port: {
            '$': parseInt(process.env.PORT) || 8089,
            '@enabled': true,
        },
        vipAddress: 'notification-service',
        statusPageUrl: `http://${process.env.EUREKA_HOST || 'localhost'}:${process.env.PORT || 8089}/actuator/health`,
        healthCheckUrl: `http://${process.env.EUREKA_HOST || 'localhost'}:${process.env.PORT || 8089}/actuator/health`,
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
    },
    eureka: {
        host: process.env.EUREKA_HOST || 'localhost',
        port: parseInt(process.env.EUREKA_PORT) || 8761,
        servicePath: '/eureka/apps/',
        maxRetries: 3,
        requestRetryDelay: 5000,
    },
});

module.exports = eurekaClient;
