# Task Management System

A full-stack Task Management System built for the Full Stack Developer Assignment.  
The application allows users to manage personal tasks, assign tasks to other users, and enforce role-based permissions using JWT authentication.

## Live Demo

- **Frontend:** https://task-management-system-inky.vercel.app/
- **Backend :** https://web-production-7c5de.up.railway.app/
- **GitHub Repository:** https://github.com/gaudakash/task-management-system

---

## Features

### Authentication
- User Registration
- User Login
- JWT-based authentication
- Secure password hashing
- Protected routes

### Task Management
- Create tasks
- View tasks
- Update tasks
- Delete tasks

### Task Types
#### Personal Tasks
- Created by a user
- Visible only to the creator
- Creator can edit all fields

#### Assigned Tasks
- A user can assign a task to another user
- Visible to both assigner and assignee

### Role-Based Permissions
#### Assignee
- Can only update the task status
- Cannot modify title, description, priority, or due date

#### Assigner
- Can view the task and its progress
- Can update the due date
- Cannot update task status

### UI/UX
- Clean and usable interface
- Loading states
- Empty states
- Error handling
- Responsive layout

---

## Tech Stack

### Backend
- Python
- Django
- Django REST Framework
- Simple JWT
- PostgreSQL
- Gunicorn
- Railway

### Frontend
- React
- Vite
- Axios
- React Router DOM
- Vercel

---

## Project Structure

```bash
task-management-system/
│
├── backend/
│   ├── accounts/
│   ├── tasks/
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── public/
│   ├── package.json
│   └── vercel.json
│
└── README.md
