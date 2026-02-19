Readme · MD
Copy

# 🧠 Codebase AI
### An AI-Powered Project Intelligence System Using RAG

> Upload your project. Talk to your code. Understand everything.

---

## 📌 What is Codebase AI?

**Codebase AI** is an intelligent system that lets students and developers upload their entire software project and interact with it through AI — without manually reading files.

Instead of copy-pasting code into ChatGPT, Codebase AI **understands your full project** and answers questions, simulates viva exams, prepares you for interviews, reviews your code quality, and helps you debug — all based on your actual codebase.

---

## 🚀 Features

| Mode | Description |
|------|-------------|
| 📘 **Explain Mode** | Get step-by-step explanations of any code logic or flow |
| 💼 **Interview Mode** | Generates technical interview questions from your project |
| 🛠 **Review Mode** | Audits code for security issues, bad practices & improvements |
| 🐛 **Debug Mode** | Traces root causes of bugs with fix suggestions |
| 🏗 **Architecture Mode** | Explains system structure, components & data flow |

---

## ⚙️ How It Works

Codebase AI is powered by **RAG (Retrieval-Augmented Generation)** — the AI retrieves relevant parts of your actual code before generating any answer, ensuring accuracy and eliminating hallucination.

```
Upload Project (ZIP / GitHub)
        ↓
   File Processing
  (filter source files)
        ↓
    Code Chunking
  (split into pieces)
        ↓
 Embedding Generation
  (convert to vectors)
        ↓
  Vector Storage (pgvector)
        ↓
     User Query
  (select mode + ask)
        ↓
  Semantic Search
  (find relevant chunks)
        ↓
  LLM Response Generation
  (grounded in your code)
```

---

## 🏗️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Python** | Core programming language |
| **FastAPI** | High-performance async REST API framework |

### Database
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary relational database |
| **pgvector** | Vector similarity search extension for storing & querying embeddings |

### AI / ML Layer
| Technology | Purpose |
|------------|---------|
| **LLM (Local / API-based)** | Generates natural language responses |
| **Embedding Model** | Converts code chunks into numerical vectors |
| **RAG Pipeline** | Retrieves relevant code context before generation |

---
