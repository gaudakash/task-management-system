# 📋 Task Management System

A full-stack task management application with JWT authentication, 
role-based permissions, and support for personal and assigned tasks.

## 🖥 Live Demo

- **Frontend:** [Your Vercel URL here]
- **Backend API:** [Your Railway URL here]

## 🛠 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Python 3.x, Django 4.2, DRF 3.14   |
| Auth       | JWT (djangorestframework-simplejwt) |
| Frontend   | React 18 (Vite)                     |
| Database   | SQLite (dev) / PostgreSQL (prod)    |
| Styling    | Custom CSS                          |
| Deployment | Railway (backend) + Vercel (frontend)|

## 👤 Sample User Credentials

| Username    | Password    |
|-------------|-------------|
| Shreyavaidya    | Shreya@12345  |
| DevPy    | Dev@56789  |
| john_doe    | Test@12345  |
| jane_smith  | Test@12345  |

## 🚀 Local Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py shell