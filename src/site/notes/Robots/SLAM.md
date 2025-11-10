---
{"dg-publish":true,"permalink":"/robots/slam/"}
---

### **What is robot mapping?**  
Robot mapping means the robot builds a model of the environment as it moves.

**State estimation**  
Finding the robot’s best guess of its condition or position.

**Mapping**  
Building a map of the environment.

**Localization**  
Finding the robot’s location inside the map.

**SLAM**  
Doing mapping and localization at the same time.

**Navigation**  
Moving the robot from one place to another safely.

**Motion planning**  
Planning the best path for the robot to move.

---

#### **What is SLAM?**  
SLAM means the robot finds its own pose and builds a map of the environment at the same time.

---

**Localization → location**  
Finding where the robot is.

**Mapping → environment**  
Building the shape of the environment.

**SLAM → both at same time**  
Finding location + building map together.

---

#### **Definition of the SLAM Problem**

**Given:**
- Robot controls
- Robot observations
**Wanted:**
- Map of the environment
- Path of the robot

---
### **Bayes Filter explanation** 

**Goal:**  
Technically, the Bayes Filter estimates the probability of the robot’s state (x_t) given all past measurements (z_{1:t}) and controls (u_{1:t}):

$$
p(x_t \mid z_{1:t}, u_{1:t})  
$$
Intuition: It answers the question, _“Where am I right now?”_ using everything the robot has sensed and done.

---

**Prediction Step:**  
Technically: The filter uses the motion model to predict the new state from the previous state:

$$
\bar{p}(x_t) = \int p(x_t \mid u_t, x_{t-1}) , p(x_{t-1} \mid z_{1:t-1}, u_{1:t-1}) , dx_{t-1}  
$$

Intuition: “If I moved like this, where could I possibly be?” The robot accounts for uncertainty in motion (wheels slip, sensors drift).

---

**Update Step:**  
Technically: The predicted state is corrected using the sensor model:

$$
p(x_t \mid z_{1:t}, u_{1:t}) = \eta , p(z_t \mid x_t) , \bar{p}(x_t)  
$$

Intuition: “Do my eyes, lidar, or cameras agree with my guess?” The robot compares its prediction with what it observes and adjusts its position estimate accordingly.

---

**Uncertainty Handling:**  
Technically: Motion and sensor noise are explicitly modeled using probability distributions, often Gaussian.

Intuition: “I think I moved 1 meter, but maybe it was slightly more or less.” The robot knows its movements and sensors are imperfect.

---

**Recursive Nature:**  
Technically: The posterior at time (t-1) becomes the prior for time (t), so the robot only needs the previous estimate to update its belief.

Intuition: “I only need to remember where I was last step and what I just sensed.” No need to store the entire history.

---

**Special Cases:**

- Kalman Filter: linear system with Gaussian noise
- Extended Kalman Filter (EKF): non-linear system, approximated as linear
- Particle Filter: represents any probability shape using samples

Intuition: These are different ways for the robot to guess and correct depending on how messy the environment is.

---

**Core Intuition:**  
Bayes Filter = **Guess + Check repeatedly**.
- Prediction = guess from motion    
- Update = check with sensors
- Probabilities = robot’s confidence

It keeps repeating this cycle, continuously refining the robot’s belief of where it is.
