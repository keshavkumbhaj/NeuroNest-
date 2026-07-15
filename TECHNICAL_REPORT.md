# 🛠️ Technical Report

## Project Overview

NeuroNest is an offline AI-powered habit tracking and productivity companion that combines habit management, daily reflections, and personalized AI coaching while preserving complete user privacy.

Unlike traditional AI assistants, NeuroNest performs inference entirely on-device without relying on cloud APIs.

---

# AI Model

**Model Name**

- Qwen2.5-3B-Instruct

**Model Format**

- GGUF

**Quantization**

- Q4_K_M

**Model Parameters**

- 3 Billion Parameters

---

# AI Runtime

NeuroNest uses **llama.cpp** as the inference runtime.

The backend invokes `llama-cli.exe` to perform local inference on demand.

Runtime Features:

- Offline inference
- CPU execution
- GGUF model support
- Lightweight deployment

---

# Inference Pipeline

1. User submits a reflection.
2. Flask constructs a prompt using:
   - Reflection
   - Completed habits
   - Pending habits
3. `ai_engine.py` launches llama.cpp.
4. llama.cpp loads the GGUF model.
5. The model generates personalized coaching.
6. Output is cleaned and returned to the frontend.

---

# Model Optimization

The following optimization techniques are used:

- GGUF model format
- Q4_K_M quantization
- CPU-based inference
- Prompt engineering to keep responses concise

These optimizations reduce memory usage while maintaining high-quality responses.

---

# Device Specifications

Project tested on:

| Component | Specification |
|----------|---------------|
| Processor | AMD Ryzen 5 5625U |
| RAM | 16 GB |
| Operating System | Windows 11 |
| Storage | SSD |

---

# Performance

Approximate performance observed during testing:

| Metric | Value |
|--------|-------|
| Runtime | llama.cpp |
| Execution | CPU |
| Average Inference Time | 5–10 seconds |
| Internet Required | No |

Performance may vary depending on hardware.

---

# Memory Usage

The project is designed to run on consumer laptops.

Memory consumption primarily depends on loading the Qwen2.5-3B GGUF model through llama.cpp.

No GPU is required.

---

# Technologies Used

## Frontend

- React
- Vite
- JavaScript
- CSS

## Backend

- Python
- Flask
- SQLAlchemy
- SQLite

## AI

- llama.cpp
- Qwen2.5-3B-Instruct
- GGUF

---

# Testing

The following features were tested:

- Habit creation
- Habit deletion
- Habit completion
- Reflection storage
- Progress tracking
- Offline AI response generation
- Local database persistence

---

# Known Limitations

- AI inference speed depends on CPU performance.
- Responses may vary due to the generative nature of the language model.
- Weekly analytics currently provide basic visualization.
- No user authentication in the current version.

---

# Future Improvements

- Faster inference using GPU acceleration
- Weekly and monthly analytics
- User authentication
- Multi-user support
- Mobile application
- Additional offline AI models
- Smarter personalized habit recommendations

---

# Conclusion

NeuroNest demonstrates that modern AI-powered productivity tools can operate entirely offline while providing intelligent, privacy-preserving assistance. By combining React, Flask, SQLite, llama.cpp, and the Qwen2.5-3B model, the application delivers an efficient and accessible on-device AI experience.