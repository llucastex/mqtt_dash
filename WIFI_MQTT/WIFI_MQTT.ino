#include<Wire.h>
#include<WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_ADXL345_U.h>

#define BUTTON_ACT 2 // GPIO do botão
#define LED_GPIO 12 // Pino do LED
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345); // Instancia o acelerômetro

char buf[30]; // array utilizado para concatenar as medições
char x_measure[8];
char y_measure[8];
char z_measure[8];
byte state = 0; // variaveis de estado do botão
byte save_state;

float x_vet[50];
float y_vet[50];
float z_vet[50];
float x_rms;
float y_rms;
float z_rms;


const char* SSID = "NET_2.4";                // SSID / nome da rede WiFi que deseja se conectar
const char* PASSWORD = "lucas1234"; 


const char* BROKER_MQTT = "mqtt.eclipseprojects.io"; //URL do broker MQTT que se deseja utilizar
int BROKER_PORT = 1883;    
WiFiClient espClient;               // Porta do Broker MQTT
void conectaWiFi();
void conectaMQTT(); 
void mantemConexoes();
void recebePacote(char* topic, byte* payload, unsigned int length);

#define ID_MQTT  "ADXL_LUCAS_TESTE"            //Informe um ID unico e seu. Caso sejam usados IDs repetidos a ultima conexão irá sobrepor a anterior. 
#define TOPIC_PUBLISH "MEDIDOR_ADXL_TESTE"    //Informe um Tópico único. Caso sejam usados tópicos em duplicidade, o último irá eliminar o anterior.
#define TOPIC_SUBSCRIBE "TESTE/output" 
PubSubClient MQTT(espClient); 

void setup() {
  pinMode(LED_GPIO, OUTPUT);
  pinMode(BUTTON_ACT, INPUT_PULLDOWN);
  Serial.begin(9600);
  delay(1000);


  Serial.println("Accelerometer Test"); Serial.println("");
  
  /* Initialise the sensor */
  if(!accel.begin())
  {
    /* There was a problem detecting the ADXL345 ... check your connections */
    Serial.println("Ooops, no ADXL345 detected ... Check your wiring!");
    while(1);
  }
  accel.setRange(ADXL345_RANGE_16_G);
  Serial.println("");

  conectaWiFi();
  MQTT.setServer(BROKER_MQTT, BROKER_PORT);
  MQTT.setCallback(recebePacote);
  MQTT.subscribe(TOPIC_SUBSCRIBE);
}

void conectaWiFi() {

  if(WiFi.status() == WL_CONNECTED){
    return;
  }

  WiFi.begin(SSID, PASSWORD);
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.println("Em processo de conexao");
  }

    Serial.println("Conectado!");
}


void conectaMQTT() {   
    while (!MQTT.connected()) {
        Serial.print("Conectando ao Broker MQTT: ");
        Serial.println(BROKER_MQTT);
        if (MQTT.connect(ID_MQTT)) {
            Serial.println("Conectado ao Broker com sucesso!");
        } 
        else {
            Serial.println("Noo foi possivel se conectar ao broker.");
            Serial.println("Nova tentatica de conexao em 2s");
            delay(2000);
        }
    }
}

void mantemConexoes() {
    if (!MQTT.connected()) {
       conectaMQTT(); 
    }
    
    conectaWiFi(); //se não há conexão com o WiFI, a conexão é refeita
}

void recebePacote(char* topic, byte* payload, unsigned int length){
    String msg;
    for (int i = 0; i < length; i++){
        char c = (char)payload[i];
        msg += c;        
    }

    if (msg == "1"){
      digitalWrite(LED_GPIO, HIGH);
      getLeitura();
      delay(1000);
      digitalWrite(LED_GPIO, LOW);
    }
}

float getRMS (float * val, int arrayCount)
{
    int i;
    float sumsq = 0;
    float RMS;

    for (i = 0; i< arrayCount; i++)
    {
        sumsq += val[i]*val[i];
    }
    RMS = sqrt(sumsq/arrayCount);
    return RMS;
}

void getLeitura(){
    sensors_event_t event; 
    accel.getEvent(&event);
    for (int i = 0; i<50; i++){
      x_vet[i] = event.acceleration.x;
      y_vet[i] = event.acceleration.y;
      z_vet[i] = event.acceleration.z;
    }
    float x_rms = getRMS(x_vet, 50);
    float y_rms = getRMS(y_vet, 50);
    float z_rms = getRMS(z_vet, 50);
    dtostrf(x_rms, 6, 2, x_measure);
    dtostrf(y_rms, 6, 2, y_measure);
    dtostrf(z_rms, 6, 2, z_measure);
    strcpy(buf,x_measure);
    strcat(buf,",");
    strcat(buf,y_measure);
    strcat(buf,",");
    strcat(buf,z_measure);
    MQTT.publish(TOPIC_PUBLISH, buf);
    Serial.println("Payload enviado!");
}

void loop() {
  MQTT.subscribe(TOPIC_SUBSCRIBE);
  if (digitalRead(BUTTON_ACT) == HIGH && state == 0){
    digitalWrite(LED_GPIO, HIGH);
    delay(20);

    getLeitura();
    state = 1;
  }

  if (digitalRead(BUTTON_ACT) == LOW && state == 1){
    digitalWrite(LED_GPIO, LOW);
    delay(20);
    state = 0;
  }
  mantemConexoes();
  MQTT.loop();
}
