```markdown
# Serene – AI Journal Chatbot

**Team 41 – Cache Me If You Can**  
*BGS College of Engineering and Technology*

---

## 🌟 Overview

**Serene** is an AI-powered journaling chatbot built to promote emotional well-being through conversation. It offers users a safe, friendly space to express their thoughts and feelings, while receiving intelligent, empathetic responses generated by AI.

Created as part of the **Advaya Hackathon 2024** under the theme:  
**“Improving Healthcare Through Technology”**

---

## 💡 Problem Statement

> **AI Journal – Your Emotional Well-being Companion**  
> A mental health assistant that enables users to document their emotions and get supportive, AI-driven responses in real time.

---

## 👥 Team Members

- **Aditya K** (Team Leader)  
  📧 adityak.10102005@gmail.com  

- **Punarvi M U**

- **Rakshith H N**

- **Sunidhi Srikanth Devaru**

---

## 🛠️ Features

- 🧠 **AI-based Chatbot** that simulates journaling with emotional intelligence
- 💬 **Sentiment Analysis** to detect emotional tones in user input
- 🎨 **Light/Dark Mode Toggle** for comfortable user experience
- 💻 **Chat-Style Interface** with smooth user/bot message bubbles
- 🔌 **Python–JavaScript Integration** using FastAPI and Node.js
- 🕒 **Initial Greeting** with interactive input system

---

## 📁 Project Structure

```
├── index.html             # Main chatbot frontend layout
├── style.css              # Light/Dark themes and styling
├── app.js                 # Frontend interaction logic
├── server.js              # Node.js backend server (API relay)
├── deepseek_api.py        # Python backend for AI response generation
├── package.json           # Node.js dependencies
├── requirements.txt       # Python dependencies
└── README.md              # Project documentation
```

---

## 🚀 Getting Started

### 🔧 Prerequisites

- [Node.js](https://nodejs.org/) & npm
- [Python 3.8+](https://www.python.org/)

### 🧪 Installation

1. Clone the repository:

``` bash
git clone https://github.com/AdvayaHackathon/41.Cache_Me_If_You_Can.git
cd 41.Cache_Me_If_You_Can
```

2. Install Node.js dependencies:

``` bash
npm install
```

3. Install Python dependencies:

```bash
pip install -r requirements.txt
```

4. Start the Python FastAPI backend:

```bash
python deepseek_api.py
```

5. Start the Node.js server:

```bash
node server.js
```

6. Open the chatbot at:

```
http://localhost:8000
```

---

## 🌗 Light/Dark Mode

Users can toggle between **Light** and **Dark** themes using the toggle switch. The setting is stored locally, ensuring a consistent experience even after page reloads.

---

## 🧠 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js (Express), Python (FastAPI)
- **AI Integration:** DGemini Flash 1.5, `@xenova/transformers` for sentiment analysis
- **Tools:** Git, GitHub, VS Code

---

## 🤝 Contributing

We welcome contributions to enhance Serene!  
Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.

---

> Made during **Advaya Hackathon 2024** – Empowering Minds Through Technology
```
