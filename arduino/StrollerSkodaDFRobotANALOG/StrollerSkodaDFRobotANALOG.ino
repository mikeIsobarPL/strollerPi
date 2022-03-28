#include <SoftwareSerial.h>
#include <Wire.h>
#include <OneWire.h>

#define SLAVE_ADDRESS 0x08

unsigned char data[4] = {};
float distance;
byte b[6] = {2, 1, 2, 3, 4, 5 };

int incomeData[9];

const int brakePin = 3; // zeby hamowac
const int handBrakePin = 10; // zeby czytac czy jest przycisk wcisniety czy nie

int testModeCounter = 0;

const boolean TEST_MODE = true;



int handBrakeState = 0;



//long distance1, distance2, distance3, distance4;

typedef struct {
  int pin;
  int triggerPin;
  int distance;
} Sensor;

Sensor sensors[5] ={{1,9, 0}, {3,7, 0}, {7,5,0}, {10,12,0}, {12,8,0}};

const double CM = 2.54;
const int SENSORS_NUM = 5;
const int MIN_DISTANCE = 20;
const int MIN_DISTANCE_VALUE = 1;

void setup() {
  pinMode(brakePin, OUTPUT);
  pinMode(handBrakePin, INPUT);
  brake(1);

  for(int i = 0; i < SENSORS_NUM; i++)
  {
    pinMode(sensors[i].triggerPin, OUTPUT);
  }
  
  Serial.begin(9600);  // sets the serial port to 9600
  initWire();
}

void read_sensors(){

  for(int i = 0; i < SENSORS_NUM; i++)
  {
    digitalWrite(sensors[i].triggerPin,HIGH);
    delay(1);
    digitalWrite(sensors[i].triggerPin,LOW);
        
    sensors[i].distance = (analogRead(sensors[i].pin)/2)*CM;
    
    if(sensors[i].distance < MIN_DISTANCE)
    {
      sensors[i].distance = MIN_DISTANCE_VALUE;
      
    }
      
    saveDataToBytes(i, sensors[i].distance);
    printSensor(i);
    delay(50);
    

  }
  
  Serial.println(" !");
}

void printSensor(int id)
{
  Serial.print(sensors[id].distance);
  Serial.print(" ");
}

void loop() {
  read_sensors();
  checkHandBrake();
}

int checkHandBrake()
{
   handBrakeState = digitalRead(handBrakePin);
   
  // Serial.print("checking hand brake " );
   //Serial.println( handBrakeState);
   saveBrakeToBytes(handBrakeState);
   return handBrakeState;
   
}

void brake(int state)
{
   digitalWrite(brakePin, state);
}

void initWire()
{
  Wire.begin(SLAVE_ADDRESS);
  Wire.onReceive(receiveData);
  Wire.onRequest(sendData);
  
  if(TEST_MODE)
    Serial.println("I2C Ready!");
}

void receiveData(int byteCount) {
  while (Wire.available()) {
    incomeData[0] = Wire.read();
    if (incomeData[0] == 0)
      brake(0);
    else
      brake(1);
   

  }
}

void sendData() 
{
  Wire.write(b, 6); //todo change
  
  if(TEST_MODE)
  {
   
    
    if(testModeCounter++ ==2)
    {
      testModeCounter = 0;
      for(int i = 0; i < 6; i++)
      {
        int v = b[i]*2;
        if(v < 10)
          Serial.print("0");
        if(v < 99)
          Serial.print("0");
          
        Serial.print(v);Serial.print(" : ");
      }
      
      Serial.println();
    }
  }
}

void saveDataToBytes(int id, float value)
{
 // Serial.println(b[id]);
  int distanceByte = int(value / 2);
  
  if(distanceByte > 250)
    distanceByte = 250;

  
  
  b[id] = distanceByte;
  
}

void saveBrakeToBytes(int value)
{
 // Serial.println(b[id]);
  b[5] = value;
}


void parseData(int id)
{
  
  if (data[0] == 0xff)
  {
    int sum;
    sum = (data[0] + data[1] + data[2]) & 0x00FF;
    
    if (sum == data[3])
    {
      distance = (data[1] << 8) + data[2];
      if (distance > 280)
      {
        saveDataToBytes(id, distance / 10);
      }else
      {
        saveDataToBytes(id, 2);
      }
    } else
    {
      //Serial.print(id); Serial.print(" ERROR "); Serial.print(sum); Serial.println(data[3]);
      saveDataToBytes(id, 1);
    }
  }
}
