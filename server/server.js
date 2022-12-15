const { getDatabase, ref, update, onValue, push } = require('firebase/database');
const express = require('express');
const client_mqtt = require('../mqtt_req');
const db = require('../db/connectDb');
const path = require('path');

const app = express();
const pubTopic = 'TESTE/output' // Topico do Publisher
const subTopic = 'MEDIDOR_ADXL_TESTE' // Topico do Subscriber

// Ao conectar da um log no tópico inscrito
client_mqtt.on('connect', () => {
  console.log('Connected')
  client_mqtt.subscribe([subTopic], () => {
    console.log(`Subscribe to topic '${subTopic}'`)
  })
})

// Ao receber uma leitura salva no banco de dados
client_mqtt.on('message', (subTopic, payload) => {
    var msg = payload.toString()
    console.log('Received Message: ' + msg + ' from ' + subTopic)
    var msg_split = msg.split(',');
    x_msg = msg_split[0];
    y_msg = msg_split[1];
    z_msg = msg_split[2];
    push(ref(db, 'dados'), {
        x: x_msg,
        y: y_msg,
        z: z_msg,
        date: generateDate()
      })
  })

// Verifica se a variavel de estado no banco de dados foi atualizada e manda um dado pro ESP32
// solicitando a leitura 
onValue(ref(db, 'estado'), (snapshot) => {
    const data = snapshot.val();
    if (data['on'] == 1){
      client_mqtt.publish(pubTopic, "1");
      update(ref(db, 'estado'), {
        off: 1,
        on: 0,
      })
    }
});

var options = {
    dotfiles: 'ignore',
    etag: true,
    extensions: ['htm', 'html'],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
      res.set('x-timestamp', Date.now())
    }
  }


app.listen(3000, ()=>{
    console.log("Servidor Inicializado!");
});

app.get('/static/javascript.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../static/javascript.js'));
});


app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, '../static/index.html'));
});

function generateDate(){
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  const formattedToday = dd + '/' + mm + '/' + yyyy;
  return formattedToday
}