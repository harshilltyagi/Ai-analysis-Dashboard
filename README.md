# AI Analysis Dashboard

An AI-powered full-stack MERN application that allows users to upload CSV files, analyze datasets, visualize trends, and receive smart business insights using AI.

## 🚀 Live Demo

Frontend: https://ai-analysis-dashboard-one.vercel.app  
Backend: https://ai-analysis-dashboard-1.onrender.com

---

## 📌 Features

### 🔐 Authentication
- User Signup
- User Login
- JWT Token Based Authentication
- Protected Routes
- Logout Functionality

### 📁 CSV Upload
- Upload CSV files
- Parse CSV data instantly
- Preview uploaded dataset
- Store parsed data for report generation

### 🤖 AI Analysis
- AI-generated dataset summary
- Smart insights from uploaded CSV
- Business recommendations
- Ask AI custom questions about data

### 📊 Dashboard & Charts
- KPI cards
- Average Price
- Average Stock
- Top Category
- Highest Product
- Bar Charts
- Pie Charts
- Interactive Analytics UI

### 🌐 Deployment
- Frontend deployed on Vercel
- Backend deployed on Render
- MongoDB Atlas database

---

## 🛠 Tech Stack

### Frontend
- React.js
- React Router DOM
- Tailwind CSS
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

### AI Integration
- Groq API (Llama Model)

### Deployment
- Vercel
- Render

---

## 📂 Project Structure

```bash
AI-Analysis-Dashboard/
│── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.jsx
│
│── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   └── index.js
