# 🛠️ Septic Tank Monitoring System 🚰

This thesis project is a comprehensive **Septic Tank Monitoring System** that leverages IoT technology and web development to provide real-time monitoring, predictive analysis, and user-friendly visualization. It combines hardware modules for data collection and transmission with a modern web application for insights and alerts.  

Whether you're managing a single septic tank or multiple tanks, this system ensures efficient and hassle-free monitoring with a scalable and secure setup.

---

## 🚀 Key Components

### 1. Sensor Module  
The **Sensor Module** is responsible for measuring the liquid level in the septic tank and transmitting the data wirelessly.  

#### Hardware:
- **JSN-SR04T (IP68 Ultrasonic Sensor):**  
  Measures the distance from the liquid's surface to the bottom of the tank using ultrasonic waves.
- **LoRa SX1278 Module:**  
  Transmits measured data wirelessly to the Monitoring Module using long-range, low-power communication.
- **Arduino Uno R3:**  
  Handles sensor readings and data transmission.

#### Functionality:
1. Ultrasonic waves are sent and received by the JSN-SR04T sensor to calculate the distance:  
   `distance = duration * 0.034 / 2`  
2. The distance is adjusted to account for the tank's configuration and converted into **remaining capacity**.
3. Data is transmitted via the LoRa SX1278 module to the **Monitoring Module**.

#### Code Workflow:
```cpp
duration = pulseIn(echoPin, HIGH); // Trigger Ultrasonic waves
distance = duration * 0.034 / 2;  // Calculate distance in cm
LoRa.print(distance);  // Transmit data
```
### 2. Monitoring Module  
The **Monitoring Module** processes incoming data, calculates the septic tank's capacity percentage, stores it in a database, and notifies the user of critical conditions.

#### Hardware:
- **ESP32:**  
  Acts as the processing hub and communication gateway.
- **LoRa SX1278 Module:**  
  Receives data from the Sensor Module.
- **SIM800L EVB GSM Module:**  
  Sends SMS alerts for critical tank levels.

#### Functionality:
1. The **capacity percentage** is calculated from the received distance data:  
   `Capacity % = ((SepticTank_Height - distance) * 100) / Septictank_Height`
2. Data is sent to **Firebase Realtime Database**, including:
   - Capacity percentage
   - Unix timestamp
   - Human-readable date
3. If the capacity exceeds a defined threshold, an **SMS alert** is sent to the user.

---

### 3. Web Application  
The **Web Application** visualizes the septic tank data and provides predictive insights for efficient management.

#### Technologies:
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Firebase Realtime Database

#### Features:
1. **Dashboard:**  
   - **Doughnut Chart:** Displays the current tank capacity percentage.  
   - **Historical Graph:** Shows trends over time.  
   - **Prediction Algorithm:** Estimates when the tank will be full based on historical data.  
2. **Dynamic Rendering:**  
   - Automatically adapts to display data for multiple tanks associated with the user.
3. **User Authentication:**  
   - Secure login ensures data privacy and personalized access.
4. **Real-Time Updates:**  
   - Septic Tank data updates instantly via Firebase integration.
5. **Alerts:**  
   - SMS notification for critical capacity level.

#### Why It Stands Out:
- **Interactive Visuals:** Makes data easy to understand.  
- **Predictive Analytics:** Helps you plan ahead and avoid emergencies.  
- **Scalable Design:** Supports monitoring of multiple tanks seamlessly.  

---

## ⚙️ How It Works

1. **Data Collection:**  
   - The Sensor Module measures the liquid level and sends data to the Monitoring Module via LoRa.
2. **Data Processing:**  
   - The Monitoring Module calculates the capacity percentage and stores it in Firebase.
3. **User Notifications:**  
   - SMS alerts are sent when the capacity exceeds a critical threshold.
4. **Web Visualization:**  
   - The Web Application fetches and displays data dynamically, with visual insights and predictions.

---

## 🔒 Security and Scalability

- **Authentication:**  
  User login ensures secure access to data.
- **Dynamic Rendering:**  
  Personalized views for each user, with scalability for multiple tanks.
- **Firebase Integration:**  
  Real-time, secure, and reliable data storage.

---

## 📈 Key Benefits

- **Remote Monitoring:** View your septic tank's status anytime, anywhere.  
- **Actionable Insights:** Predict when your tank will need maintenance.  
- **Critical Alerts:** Stay informed with timely SMS notifications.  
- **User-Friendly Interface:** Simple and intuitive design for ease of use.  

---

## 🌟 Why This System?

This project demonstrates the power of IoT, embedded systems, and modern web technologies in solving real-world problems. It’s built with scalability, security, and user convenience at its core, making it an ideal solution for smart septic tank management.

---

## 🛠️ Get Started

This is still a proof of concept :D

