# 🎯 XCalibr: Comprehensive AI Hiring System

> **An intelligent, full-stack recruitment platform that leverages Generative AI (Llama 3) to automate resume screening, cross-verify candidate data, and reduce hiring bias.**

![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-FastAPI_|_React_|_Llama3-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Abstract
**XCalibr** is a modern solution designed to tackle the inefficiencies of traditional Applicant Tracking Systems (ATS). Unlike standard systems that rely on keyword stuffing, XCalibr uses a **locally hosted Large Language Model (Llama 3)** to semantically analyze a candidate's entire digital footprint.

It aggregates data from **Resumes (PDF), LinkedIn profiles, GitHub repositories, and LeetCode activity** to provide a holistic, bias-reduced "Suitability Score" for HR recruiters. This project was developed as a Minor Project at **Amrita School of Arts and Science,Kochi**.

---

## ✨ Key Features

### 🤖 AI-Powered Analysis Engine
* **Holistic Parsing:** Extracts and synthesizes data from multiple sources:
    * **Resume & LinkedIn:** Parses PDFs to extract work history and skills.
    * **GitHub & LeetCode:** Validates technical claims by analyzing actual coding activity and problem-solving stats.
* **Semantic Matching:** Compares candidate profiles against Job Descriptions (JD) using context, not just keywords.

### 📊 Proprietary Scoring System
The system generates a suite of objective scores to rank candidates:
1.  **Trust Score:** Validates the authenticity of a resume by cross-referencing it with LinkedIn and GitHub data (e.g., verifying if "Python" listed on CV appears in GitHub repos).
2.  **JD Match Score:** Measures semantic alignment with the specific job requirements.
3.  **Career Readiness Score:** Evaluates the trajectory and quality of experience.
4.  **GitHub & LeetCode Scores:** Quantifies technical competency and consistency.

### 📨 Intelligent Workflow
* **Role-Based Access:** Secure dashboards for **Admins**, **HR Managers**, and **Candidates**.
* **Automated Feedback:** Prevents "ghosting" by allowing HR to send AI-generated, constructive feedback to candidates with one click.
* **Privacy-First:** All AI processing is done **locally via Ollama**, ensuring no sensitive candidate data is sent to third-party APIs.

---

## 🛠️ System Architecture

**XCalibr** follows a decoupled 3-Tier Architecture designed for performance and scalability:

* **Frontend (User Interface):** Built with **React.js (Vite)** for a fast, responsive experience.
* **Backend (Logic Layer):** Powered by **FastAPI (Python)**, handling asynchronous tasks, authentication, and analysis orchestration.
* **Data & AI Layer:**
    * **Database:** **PostgreSQL** for relational data integrity (User profiles, Applications, Logs).
    * **AI Engine:** **Ollama** serving the **Meta Llama 3 (8B)** model locally.

---

## 🚀 Getting Started

### Prerequisites
* Node.js & npm
* Python 3.10+
* PostgreSQL
* [Ollama](https://ollama.com/) (with Llama 3 model pulled)

### 1. Clone the Repository
```bash
git clone [https://github.com/jagath-ds/XCalibr.git](https://github.com/jagath-ds/XCalibr.git)
cd XCalibr
```
### 2. Backend Setup
#### Step A:Environment Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
```
#### Step B: Database Initialization
1. Create a PostgreSQL database named Ai_Hiring_System.

2. Import the provided SQL dump file to create all tables:
```bash
# You can import using pgAdmin or via command line:
psql -U postgres -d Ai_Hiring_System -f "Ai_Hiring_System(database).sql"
```
#### Step C: Configuration: Create a .env file in the backend/ directory:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/xcalibr_db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
```
#### Step D: Run backend server:
```bash
uvicorn main:app --reload
```
### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
### 4.AI Setup
Ensure Ollama is running:
In local CMD:
```bash
ollama serve
ollama run llama3
```
---
## 💻Usage & Access
Once the servers are running, you can access the different portals via the browser:

* **Candidate & HR Portal:** http://localhost:5173 (Standard Login)

* **Admin Portal:** http://localhost:5173/system-admin-portal-2024

* **Note:** The Admin portal is hidden from the main navigation for security. Use this direct link or .../admin/login to access system configurations.
*  Candidates can signup through normal candidate portal, but for Hr, the admin will be the ones creating hr accounts.We though of the
*  Concept of contract based service where companies can keep contracts with us based on that the accounts and other services will be provided to them.
* admin account has to be created locally a create_admin.py file is kept in backend folder for creating admins. This is done for security concerns.

---
## 👥 The Team
This project was designed and developed by the **BCA (Data Science)** team:

* **Jagath Jyothis T.S** (KH.SC.U3CDS23034)
* **Kiran Krishna P** (KH.SC.U3CDS23038)
* **Unnikrishnan Thiruvara Variyath** (KH.SC.U3CDS23062)
* **TP Devanarayanan** (KH.SC.U3CDS23061)
* **Devadath Madhusoodanan** (KH.SC.U3CDS23026)

### 🎓 Supervision & Guidance
* **Project Guide:** Smt. Rajalakshmi V R (Assistant Professor, Dept. of Computer Science)
* **Head of Department:** Dr. Sangeetha J (Dept. of Computer Science, Amrita School of Arts and Sciences, Kochi)

---

## 🔮 Future Roadmap
The current system is a robust proof-of-concept for technical hiring. We plan to expand `XCalibr` into a universal recruitment platform with these key features:
* [ ] **Domain Expansion:** Extending the AI analysis engine beyond Computer Science to support **Business Management (MBA)**, **Mechanical/Civil Engineering**, and **Creative Arts** roles.
* [ ] **Confidential Project Verification:** Developing a secure module for experienced professionals to submit **NDA-protected work** or contract details that cannot be publicly listed on LinkedIn/GitHub, allowing the AI to verify experience without exposing sensitive IP.
* [ ] **Authentication & Notifications:** Implementing **Google OAuth (Gmail)** for seamless login and automated email notifications for interview scheduling (replacing the current internal web-app messaging).
* [ ] **Live Payment Gateway:** upgrading the current static pricing page to a fully functional integration with **Stripe or Razorpay** for premium job postings.
* [ ] **Video Interview Analysis:** Using multimodal AI to analyze candidate pitch videos.
* [ ] **Advanced Code Analysis:** Static analysis of GitHub code for quality and complexity.
* [ ] **Calendar Integration:** Automated interview scheduling for shortlisted candidates.

---
*Submitted in partial fulfillment of the requirements for the degree of Bachelor of Computer Applications (Data Science) at Amrita Vishwa Vidyapeetham, Kochi Campus.*
