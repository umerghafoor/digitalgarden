---
{"dg-publish":true,"permalink":"/mqtt/"}
---


### **MQTT Setup with Mosquitto**

**1. Install Mosquitto**

```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients
```

**2. Start Broker**

```bash
mosquitto        # Run in foreground  
mosquitto -d     # Run in background
```

Check status:

```bash
sudo systemctl status mosquitto
```
![Pasted image 20251103234842.png](/img/user/attachments/Pasted%20image%2020251103234842.png)

---

### **3. Subscribe to Topic**

In **Terminal 1**:

```bash
mosquitto_sub -h localhost -t "test/topic"
```

---

### **4. Publish Message**

In **Terminal 2**:

```bash
mosquitto_pub -h localhost -t "test/topic" -m "Hello MQTT!"
```

Message will appear in Terminal 1.
![Pasted image 20251103235202.png](/img/user/attachments/Pasted%20image%2020251103235202.png)

---

### **5. Python (paho-mqtt)**

**Install:**

```bash
pip install paho-mqtt
```

**Publisher (publisher.py):**

```python
import paho.mqtt.publish as publish
publish.single("test/topic", "Hello from Python!", hostname="localhost")
```

**Subscriber (subscriber.py):**

```python
import paho.mqtt.client as mqtt

def on_message(client, userdata, msg):
    print(f"{msg.topic}: {msg.payload.decode()}")

client = mqtt.Client()
client.connect("localhost", 1883, 60)
client.subscribe("test/topic")
client.on_message = on_message
client.loop_forever()
```
