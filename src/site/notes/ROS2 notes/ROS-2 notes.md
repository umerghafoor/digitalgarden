---
{"dg-publish":true,"permalink":"/ros-2-notes/ros-2-notes/"}
---


# Replace ".bash" with your shell if you're not using bash
# Possible values are: setup.bash, setup.sh, setup.zsh
source /opt/ros/jazzy/setup.bash

### 1. Pull an official ROS 2 Docker image

For example, ROS 2 Humble (LTS):

```bash
docker pull osrf/ros:humble-desktop
```

If you need Jazzy (latest):

```bash
docker pull osrf/ros:jazzy-desktop
```

---

### 2. Run the container

```bash
docker run -it --rm osrf/ros:humble-desktop bash
```

This opens a ROS 2 shell inside the container.

---

### 3. Persist and map workspaces (recommended)

To develop with ROS 2, mount your code folder:

```bash
docker run -it --rm \
  --name ros2_container \
  -v ~/ros2_ws:/root/ros2_ws \
  osrf/ros:humble-desktop bash
```

---

### 4. Enable GUI tools (like `rviz2`)

On Linux:

```bash
xhost +local:root
docker run -it --rm \
  --net=host \
  -e DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  osrf/ros:humble-desktop bash
```

---

## **Connect an external robot** and **open your own ROS 2 code**

---

### 🧩 Step 1 — Run ROS 2 Docker with Access to Your Files + Robot

```bash
# Create a folder for your ROS2 code if not already
mkdir -p ~/ros2_ws

# Run ROS 2 Jazzy with access to USB devices and your workspace
sudo docker run -it --net=host --privileged \
    -v ~/ros2_ws:/root/ros2_ws \
    --device=/dev/ttyUSB0 \
    osrf/ros:jazzy-desktop
```

**What this does**

- `-v ~/ros2_ws:/root/ros2_ws` → lets you open and edit your saved code inside the container
- `--device=/dev/ttyUSB0` → gives ROS 2 access to your robot’s serial port
- `--net=host` → shares network so you can talk to the robot over Wi-Fi/Ethernet

> ⚠️ Replace `/dev/ttyUSB0` with your robot’s port (run `ls /dev/tty*` to find it).

---

### 🧠 Step 2 — Build Your Saved Code

Once inside the container:

```bash
cd ~/ros2_ws
colcon build
source install/setup.bash
```

Then run your nodes:

```bash
ros2 run your_package your_node
```

---

### 🧰 Step 3 — Access from Ubuntu Host

If you edit files in `~/ros2_ws` using VS Code or another editor, they’ll update inside Docker instantly (because of the shared folder).

---

### ⚡ Optional — Create an Easy Start Script

You can save this as `run_ros2.sh`:

```bash
sudo docker run -it --net=host --privileged \
  -v ~/ros2_ws:/root/ros2_ws \
  --device=/dev/ttyUSB0 \
  osrf/ros:jazzy-desktop
```

Then start ROS 2 anytime with:

```bash
bash run_ros2.sh
```

---
