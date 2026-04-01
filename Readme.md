# 🌍 Community Connect

Community Connect is a **MERN stack web application** that connects **NGOs with volunteers** by prioritizing real-time requirements. Volunteers can discover needs, donate, or communicate with NGOs, while admins manage and verify organizations.

---

## 🚀 Features

### 👨‍💼 Admin
- Secure admin login
- Manage volunteers (view, edit, delete)
- Manage NGOs (verify, edit, delete)
- Dashboard with platform statistics

---

### 🙋 Volunteer
- Register & login (JWT authentication)
- Follow NGOs
- View **requirement feed** from followed NGOs
- Donate or chat with NGOs
- Receive notifications for new requirements
- Track activity history

---

### 🏢 NGO
- Register & login
- Post requirements (needs)
- View followers
- Chat with volunteers
- Track donations and activity
- Mark requirements as **fulfilled**

---

## 💡 Core Concept

This platform is **requirement-driven**, meaning:

> Volunteers focus on **what is needed**, not just organizations.

- NGOs post requirements  
- Volunteers get notified  
- Users can **donate or help via chat**  
- Completed requirements are marked to avoid duplication  

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

### Other
- JWT Authentication
- Razorpay (Payment Integration)

---


## 🔐 Authentication

- JWT-based authentication for:
  - Volunteers
  - NGOs
- Admin credentials managed via backend environment variables

---

## 💳 Payment Integration

- Integrated with **Razorpay (Test Mode)**
- Volunteers can donate to NGO requirements
- Payments are securely verified and stored

---

## 📌 Key Functionalities

- Requirement Feed (central feature)
- NGO Verification System
- Donation + Chat system
- Activity Tracking
- Status-based requirement handling (Open / Fulfilled)

---
