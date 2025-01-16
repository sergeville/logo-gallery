# MongoDB Configuration Guide

## Issue: Port Conflict Between System MongoDB and Docker

We encountered an issue where Docker couldn't start MongoDB because port 27017 was already in use. This happened because MongoDB was configured to auto-start with the system, causing conflicts with the Docker container trying to use the same port.

### Initial Symptoms
- Docker Compose failed to start with error: `Ports are not available: exposing port TCP 0.0.0.0:27017`
- System MongoDB was automatically starting on PC boot

### Solution: Moving to Docker-only MongoDB

We modified the setup to run MongoDB exclusively through Docker, eliminating conflicts with the system-level MongoDB installation.

#### Steps Taken:

1. **Stopped the system MongoDB service**
   ```bash
   sudo brew services stop mongodb-community
   ```

2. **Unloaded MongoDB from system services**
   ```bash
   sudo brew services unload mongodb-community
   ```

3. **Verified Docker MongoDB**
   ```bash
   docker compose up -d
   ```

### Current Setup

- MongoDB no longer starts automatically with the system
- MongoDB runs exclusively through Docker
- No more port conflicts between system MongoDB and Docker MongoDB

### Managing MongoDB

To manage MongoDB, use these Docker Compose commands:

- **Start MongoDB**:
  ```bash
  docker compose up -d
  ```

- **Stop MongoDB**:
  ```bash
  docker compose down
  ```

### Checking Services Status

You can check auto-starting services on your system using:
```bash
# List Brew services
brew services list

# List Launch Daemons (System)
ls -l /Library/LaunchDaemons/

# List Launch Agents (System)
ls -l /Library/LaunchAgents/

# List Launch Agents (User)
ls -l ~/Library/LaunchAgents/
``` 