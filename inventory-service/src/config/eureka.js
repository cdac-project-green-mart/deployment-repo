const Eureka = require('eureka-js-client').Eureka;
const os = require('os');

const eurekaClient = new Eureka({
    instance: {
        app: 'INVENTORY-SERVICE',
        instanceId: `inventory-service:${process.env.PORT || 8085}`,
        hostName: os.hostname(),
        ipAddr: getIPAddress(),
        port: {
            '$': parseInt(process.env.PORT) || 8085,
            '@enabled': true,
        },
        vipAddress: 'inventory-service',
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
        statusPageUrl: `http://${getIPAddress()}:${process.env.PORT || 8085}/actuator/health`,
        healthCheckUrl: `http://${getIPAddress()}:${process.env.PORT || 8085}/actuator/health`,
    },
    eureka: {
        host: process.env.EUREKA_HOST || 'localhost',
        port: parseInt(process.env.EUREKA_PORT) || 8761,
        servicePath: '/eureka/apps/',
        maxRetries: 5,
        requestRetryDelay: 2000,
    },
});

function getIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

module.exports = eurekaClient;
