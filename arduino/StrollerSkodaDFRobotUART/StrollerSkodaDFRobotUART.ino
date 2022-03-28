#include <SoftwareSerial.h>
#include <Wire.h>
#include <OneWire.h>

#define SLAVE_ADDRESS 0x08

SoftwareSerial mySerial1(12, 13); // RX, TX
unsigned char data[4] = {};
float distance;
byte b[6] = {2, 1, 2, 3, 4, 5 };

int incomeData[9];

const int brakePin = 6; // zeby hamowac
const int handBrakePin = 7; // zeby czytac czy jest przycisk wcisniety czy nie

int testModeCounter = 0;

const boolean TEST_MODE = true;

int handBrakeState = 0;

const int MAX_DISTANCE = 500;

void setup()
{
   
  pinMode(brakePin, OUTPUT);
  pinMode(handBrakePin, INPUT);
  brake(1);

  pinMode(1, INPUT);
  pinMode(18, INPUT);
  pinMode(16, INPUT);
  pinMode(14, INPUT);

  digitalWrite(1, HIGH);
  digitalWrite(14, HIGH);
  digitalWrite(16, HIGH);
  digitalWrite(18, HIGH);
  
  Serial.begin(9600);
  pinMode(0, INPUT_PULLUP);  //Serial3 Rx pin
  Serial1.begin(9600);
  Serial2.begin(9600);
  Serial3.begin(9600);

  delay(100);

  mySerial1.begin(9600);

  initWire();

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
   //Serial.print("----------- Got data: ");
   //Serial.println(incomeData[0]);

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

void loop()
{
  //if(tempCounter++ > tempCounterLimit)
   // readTemp();
  
  checkHandBrake();
  
  int d = 150;

  if(Serial.available())
  {
    do {
      for (int i = 0; i < 4; i++)
        data[i] = Serial.read();
    } while (Serial.read() == 0xff);
  
    Serial.flush();
    parseData(0);
  }


  do {
    for (int i = 0; i < 4; i++)
      data[i] = Serial1.read();
  } while (Serial1.read() == 0xff);

  Serial1.flush();
  parseData(1);


  do {
    for (int i = 0; i < 4; i++)
      data[i] = Serial2.read();
  } while (Serial2.read() == 0xff);
  Serial2.flush();
  parseData(2);


  do {
    for (int i = 0; i < 4; i++)
      data[i] = Serial3.read();
  } while (Serial3.read() == 0xff);
  Serial3.flush();
  parseData(3);



  do {
    for (int i = 0; i < 4; i++)
      data[i] = mySerial1.read();
  } while (mySerial1.read() == 0xff);

  mySerial1.flush();
  parseData(4);

 

  delay(d);

}

void saveDataToBytes(int id, float value)
{
 // Serial.println(b[id]);
  b[id] = int(value / 2);
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
      
      if (distance > 280 )
      {
        if(distance < MAX_DISTANCE*10)
          saveDataToBytes(id, distance / 10);
        else
          saveDataToBytes(id, MAX_DISTANCE);
      }else
      {
        
        if(data[1] == 0 && data[2] == 0)
        {
          //Serial.println("OVER the lower limit ");
           saveDataToBytes(id, MAX_DISTANCE);
        }else
        {
          //Serial.println("Below the lower limit ");
        
          saveDataToBytes(id, 2);
        }
      }
    } else
    {
      //Serial.print(id); Serial.print(" ERROR "); Serial.print(sum); Serial.println(data[3]);
      saveDataToBytes(id, 1);
    }
  }
}
