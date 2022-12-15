const mqtt = require('mqtt');

const host = 'mqtt.eclipseprojects.io';
const port = '1883';
const connectUrl = `mqtt://${host}:${port}`

var client = mqtt.connect(connectUrl, {
    username: 'ADXL_LUCAS_TESTE_2',
});

module.exports = client;
