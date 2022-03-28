import socketio
import time

from DFRobot_RaspberryPi_A02YYUW import DFRobot_A02_Distance as Board

connected = False

sio = socketio.Client()


@sio.event
def message(data):
    print('I received a message!')

@sio.on('my message')
def on_message(data):
    print('I received a message!')
    
@sio.event
def connect():
    global connected
    connected = True
    print("I'm connected! ",connected)
    sio.emit("HELLO_WORLD", {"role":"FRONT_SENSOR"})
 

@sio.event
def connect_error(data):
    print("The connection failed!")

@sio.event
def disconnect():
    print("I'm disconnected!")
    
sio.connect('http://localhost:9000')

MAX_RANGE = 300
SENSOR_ID = 5 #nie bedzie id+1 bo nie przechodzi przez i2c

def dispatch(distanceMM):
    realValue = int(distanceMM)
    value01 = 0
       
    
    if(realValue > MAX_RANGE):
        value01 = 1
    elif(realValue < 0): #czyli error
        value01 = -1
    elif(realValue == 2): #czyli below lower limit{
        value01 = 0
    else:
        value01 = distanceMM / MAX_RANGE
        
    
   
    dataToSend = {"id":SENSOR_ID, "value":value01, "realValue":realValue}
    
    try:
        sio.emit("SENSOR_DATA", dataToSend)
        print(dataToSend)
    except:
        print("sending error")
    
    


board = Board()

def print_distance(dis):
  if board.last_operate_status == board.STA_OK:
    print("Distance %d mm" %dis)
  elif board.last_operate_status == board.STA_ERR_CHECKSUM:
    print("ERROR")
  elif board.last_operate_status == board.STA_ERR_SERIAL:
    print("Serial open failed!")
  elif board.last_operate_status == board.STA_ERR_CHECK_OUT_LIMIT:
    print("Above the upper limit: %d" %dis)
  elif board.last_operate_status == board.STA_ERR_CHECK_LOW_LIMIT:
    print("Below the lower limit: %d" %dis)
  elif board.last_operate_status == board.STA_ERR_DATA:
    print("No data!")

if __name__ == "__main__":
  
  
  dis_min = 380  #Minimum ranging threshold: 0mm
  dis_max = 4500 #Highest ranging threshold: 4500mm
  board.set_dis_range(dis_min, dis_max)
  while True:
    distance = board.getDistance()
    #print_distance(distance)
    
    
    
    if connected:
        
        dataOK = True
        dataToSend = distance/10
        
        if board.last_operate_status == board.STA_ERR_CHECKSUM:
            dataOK = False
        elif board.last_operate_status == board.STA_ERR_SERIAL:
            dataOK = False
        elif board.last_operate_status == board.STA_ERR_CHECK_OUT_LIMIT:
            print("OUT LIMIT")
            dataToSend = MAX_RANGE
        elif board.last_operate_status == board.STA_ERR_CHECK_LOW_LIMIT:
            print("LOW LIMIT")
            dataToSend = 2
        elif board.last_operate_status == board.STA_ERR_DATA:
            dataOK = True
            dataToSend = -1
        
        if(dataOK):
            dispatch(dataToSend)
        
        
    
    time.sleep(0.6) #Delay time < 0.6s