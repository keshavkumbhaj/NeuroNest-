# 🏗️ NeuroNest Architecture

NeuroNest follows a modular client-server architecture with fully offline AI inference. The frontend communicates with a Flask backend through REST APIs, while all user data is stored locally using SQLite. Personalized coaching is generated entirely on-device using llama.cpp and the Qwen2.5-3B-Instruct GGUF model.

---

# 📐 High-Level Architecture

```
                        +----------------------+
                        |      React UI        |
                        | (Vite + JavaScript)  |
                        +----------+-----------+
                                   |
                                   | REST API
                                   |
                        +----------v-----------+
                        |     Flask Backend    |
                        |      (Python)        |
                        +----------+-----------+
                                   |
                +------------------+------------------+
                |                                     |
                |                                     |
        +-------v-------+                     +-------v-------+
        |    SQLite     |                     |   AI Engine   |
        | Local Database|                     | ai_engine.py  |
        +---------------+                     +-------+-------+
                                                      |
                                                      |
                                            +---------v----------+
                                            |     llama.cpp      |
                                            | Local LLM Runtime  |
                                            +---------+----------+
                                                      |
                                                      |
                                         +------------v-------------+
                                         | Qwen2.5-3B-Instruct GGUF |
                                         |      Offline Model       |
                                         +--------------------------+
```

---

# 🔄 Data Flow

## 1. Habit Management

- User creates or updates habits through the React interface.
- Frontend sends HTTP requests to the Flask backend.
- Flask validates the request.
- Data is stored inside the local SQLite database.
- Updated habit list is returned to the frontend.

---

## 2. Daily Progress

- User marks habits as completed.
- Backend updates today's completion status.
- Progress statistics are calculated from the database.
- Dashboard is refreshed automatically.

---

## 3. Reflection Journal

- User writes a daily reflection.
- Reflection is saved locally in SQLite.
- No reflection data leaves the device.

---

## 4. AI Coach

When the user requests coaching:

1. Frontend sends:
   - Reflection
   - Completed habits
   - Pending habits

2. Flask creates a structured prompt.

3. `ai_engine.py` launches **llama-cli.exe**.

4. llama.cpp loads the local GGUF model.

5. The model generates personalized coaching.

6. Raw model output is cleaned.

7. Clean advice is returned to the frontend.

All inference happens locally.

---

# 🧩 System Components

## Frontend

Responsible for:

- User Interface
- Habit Management
- Dashboard
- Reflection Journal
- AI Coach
- Progress Visualization

Technology:

- React
- Vite
- JavaScript
- CSS

---

## Backend

Responsible for:

- REST APIs
- Database Operations
- Habit Logic
- Reflection Management
- Prompt Construction
- AI Integration

Technology:

- Flask
- Python
- SQLAlchemy

---

## Database

SQLite stores:

- Habits
- Daily Completions
- Reflections

Benefits:

- Lightweight
- Offline
- No external database required

---

## AI Engine

The AI engine is implemented in `ai_engine.py`.

Responsibilities:

- Verify model availability
- Launch llama.cpp
- Pass prompts
- Capture responses
- Clean model output
- Return formatted advice

---

## Local AI Runtime

Runtime:

- llama.cpp

Model:

- Qwen2.5-3B-Instruct

Format:

- GGUF

Quantization:

- Q4_K_M

Execution:

- CPU-based inference

---

# 🔒 Privacy Design

NeuroNest follows a privacy-first architecture.

- No cloud AI APIs
- No external databases
- No user data uploaded
- All inference performed locally
- All habit and reflection data stored on-device

---

# 📦 Design Decisions

### React Frontend

Provides a responsive and interactive user experience.

---

### Flask Backend

Offers a lightweight REST API suitable for local desktop execution.

---

### SQLite

Chosen because it:

- Requires zero configuration
- Is lightweight
- Works offline
- Integrates easily with Flask

---

### llama.cpp

Selected because it:

- Runs efficiently on CPU
- Supports GGUF models
- Enables completely offline inference

---

### Qwen2.5-3B-Instruct

Chosen because it provides:

- High-quality instruction following
- Efficient local execution
- Good balance between performance and resource usage

---

# ✅ Offline Components

Runs completely offline:

- Habit Tracking
- Reflection Journal
- SQLite Database
- AI Coach
- LLM Inference
- Progress Tracking

Internet is **not required** after the model has been downloaded.

---

# 📊 Architecture Summary

NeuroNest combines a modern React frontend, a lightweight Flask backend, a local SQLite database, and an on-device large language model powered by llama.cpp to deliver intelligent productivity assistance while maintaining complete user privacy.