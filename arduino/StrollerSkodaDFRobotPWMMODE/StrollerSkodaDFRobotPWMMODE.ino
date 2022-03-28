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



//long distance1, distance2, distance3, distance4;

typedef struct {
  int pin;
  int distance;
} Sensor;

Sensor sensors[5] = { {13, 0}, {10, 0}, {2, 0}, {3, 0}, {4, 0} };

const int CM = 2;
const int SENSORS_NUM = 2;

const int triggerPin1 = 2;
const int triggerPin2 = 3;


int arraysize = 3;  //quantity of values to find the median (sample size). Needs to be an odd number

int rangevalue[] = {0,0,0,0,0,0};

//declare an array to store the samples. not necessary to zero the array values here, it just makes the code clearer

//int rangevalue[] = {0,0,0,0,0},; 0, 0, 0, 0};

long pulse;

int modE;


void setup() {
  Serial.begin(9600);  // sets the serial port to 9600
  pinMode(triggerPin1, OUTPUT);
  pinMode(triggerPin2, OUTPUT);

  digitalWrite(triggerPin1,HIGH);
  digitalWrite(triggerPin2,HIGH);

  for (int i = 0; i < SENSORS_NUM; i++)
  {
    pinMode(sensors[i].pin, INPUT);
  }

  initWire();
}

void stop_sensor(int id)
{
  if(id == 0)
  {
    digitalWrite(triggerPin1,HIGH);
  }else if(id == 1)
  {
    digitalWrite(triggerPin2,HIGH);
  }
}

void start_sensor(int id){
  
  if(id == 0)
  {
    digitalWrite(triggerPin1,LOW);
  }else if (id == 1)
  {
    digitalWrite(triggerPin2,LOW);
  }
}

void read_sensors_pwm()
{
  
  for (int j = 0; j < SENSORS_NUM; j++)
  {
    start_sensor(j);
    for (int i = 0; i < arraysize; i++)
    {
      pulse = pulseIn(sensors[j].pin, HIGH);
      rangevalue[i] = pulse / 58;
      delay(10);
    }

    stop_sensor(j);

    /*Serial.print(" --- ");
    Serial.print(j);
    Serial.print(" Unsorted: ");*/
    
   // printArray(rangevalue, arraysize);
    isort(rangevalue, arraysize);
    
   /*( Serial.print("Sorted: ");
    printArray(rangevalue, arraysize);*/
    modE = mode(rangevalue, arraysize);

    
    Serial.print(" * ");
    Serial.print(modE);
    sensors[j].distance = modE;
    

    
  }
  delay(100);
  Serial.println();
}

//Sorting function

// sort function (Author: Bill Gentles, Nov. 12, 2010)


void printArray(int *a, int n)
{
  for (int i = 0; i < n; i++)
  {
    Serial.print(a[i], DEC);
    Serial.print(' ');
  }

  Serial.println();
}

void isort(int *a, int n) {

  //  *a is an array pointer function

  for (int i = 1; i < n; ++i)
  {
    int j = a[i];
    int k;
    for (k = i - 1; (k >= 0) && (j < a[k]); k--)
    {
      a[k + 1] = a[k];
    }
    a[k + 1] = j;
  }
}

//Mode function, returning the mode or median.

int mode(int *x, int n) {

  int i = 0;
  int count = 0;
  int maxCount = 0;
  int mode = 0;
  int bimodal;
  int prevCount = 0;

  while (i < (n - 1)) {

    prevCount = count;
    count = 0;

    while (x[i] == x[i + 1]) {
      count++;
      i++;
    }

    if (count > prevCount & count > maxCount) {
      mode = x[i];
      maxCount = count;
      bimodal = 0;

    }

    if (count == 0) {
      i++;
    }

    if (count == maxCount) { //If the dataset has 2 or more modes.
      bimodal = 1;
    }
    if (mode == 0 || bimodal == 1) { //Return the median if there is no mode.
      mode = x[(n / 2)];

    }

    return mode;

  }

}

void read_sensors_analog() {
  /*
    Scale factor is (Vcc/512) per inch. A 5V supply yields ~9.8mV/in
    Arduino analog pin goes from 0 to 1024, so the value has to be divided by 2 to get the actual inches
  */
  /*distance1 = (analogRead(anPin1)/2)*2.54;
    distance2 = (analogRead(anPin2)/2) * 2.54;
    //distance3 = analogRead(anPin3)/2;
    // distance4 = analogRead(anPin4)/2;
    saveDataToBytes(0, distance1); //to do fix 0
    saveDataToBytes(1, distance2);*/

  for (int i = 0; i < 2; i++)
  {
    sensors[i].distance = analogRead(sensors[i].pin) * CM;
    saveDataToBytes(i, sensors[i].distance);
    printSensor(i);
  }
  Serial.println(" !");
}

void printSensor(int id)
{
  Serial.print(sensors[id].distance);
  Serial.print(" ");
}



void loop() {

  //start_sensor();
  read_sensors_pwm();
  //print_all();
  //delay(100); //This is the equivant of the amount of sensors times 50.  If you changed this to 5 sensors the delay would be 250.
}


void setup2()
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

  if (TEST_MODE)
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
  if (TEST_MODE)
  {
    Wire.write(b, 6); //todo change

    if (testModeCounter++ == 2)
    {
      testModeCounter = 0;
      for (int i = 0; i < 6; i++)
      {
        int v = b[i] * 2;
        if (v < 10)
          Serial.print("0");
        if (v < 99)
          Serial.print("0");

        Serial.print(v); Serial.print(" : ");
      }

      Serial.println();
    }
  }
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
      if (distance > 280)
      {
        saveDataToBytes(id, distance / 10);
      } else
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
