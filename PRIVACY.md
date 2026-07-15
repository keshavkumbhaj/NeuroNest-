# 🔒 Privacy and Safety

## Overview

NeuroNest is designed with a privacy-first philosophy. The application performs AI inference locally on the user's device, ensuring that personal reflections and habit data remain under the user's control.

---

# Data Collection

NeuroNest collects only the information that users explicitly provide.

This includes:

- Habit names
- Habit categories
- Daily completion status
- Daily reflections

No additional personal information is collected.

---

# Data Storage

All user data is stored locally using **SQLite**.

Stored data includes:

- Habits
- Daily progress
- Reflections

No cloud database is used.

---

# On-Device AI

NeuroNest uses:

- llama.cpp
- Qwen2.5-3B-Instruct (GGUF)

The language model runs entirely on the user's device.

User reflections are processed locally and are **never transmitted to external servers**.

---

# Internet Usage

Internet is required only for:

- Initial project setup
- Downloading dependencies
- Downloading the GGUF language model

Once configured, the application functions offline.

---

# Permissions

NeuroNest does not require access to:

- Camera
- Microphone
- Contacts
- Location
- Cloud storage

The application only accesses files necessary for local execution.

---

# Security Considerations

- User data remains on the local device.
- No cloud APIs are used for AI inference.
- No user reflections are shared with third-party services.
- SQLite provides lightweight local persistence.

---

# Known Limitations

- Local data is not automatically backed up.
- AI-generated advice may occasionally be inaccurate or overly generic.
- Performance depends on the user's hardware capabilities.

---

# Responsible AI

NeuroNest is intended to provide motivational guidance and productivity support.

The AI coach is **not** designed to provide:

- Medical advice
- Psychological counseling
- Legal advice
- Financial advice

Users should consult qualified professionals for such matters.

---

# Privacy Summary

NeuroNest demonstrates that intelligent productivity assistants can operate entirely offline while maintaining user privacy. By combining local storage with on-device AI inference, the application minimizes data exposure and gives users complete control over their personal information.