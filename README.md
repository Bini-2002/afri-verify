<p align="center">
<img src="client\src\images\Group 10.png" alt="AfriVerify Logo" width="120" height="120" />
</p>

<h1 align="center">AfriVerify</h1>

<p align="center">
<strong>Streamlining African Trade through AI-Powered Compliance.</strong>
</p>

<p align="center">
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
<img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
<img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
<img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge" alt="SQLAlchemy" />
<img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</p>



## 1. Project Description 🚀

**AfriVerify** represents a pioneering full-stack web application designed to empower African small and medium-sized enterprises (SMEs) in navigating the complexities of the African Continental Free Trade Area (AfCFTA) Rules of Origin (RoO). By leveraging AI-driven compliance tools, it enables users to efficiently evaluate RoO adherence and systematically organize evidentiary documentation essential for securing preferential tariffs.

---


Built with a modern stack:
- **Frontend**: React (Vite + Tailwind CSS) 📱
- **Backend**: FastAPI + SQLite (SQLAlchemy) ⚙️

Users can manage compliance assessments, upload supporting documents, and interact with **Zuri** — an AI assistant powered by Google Gemini for trade guidance 🤖.

---

## 2. Key Features ✨

- **JWT Authentication** (Email/Password) with secure token-based access 🔒
- **User Profile** with Home Country & Target Market settings 📍
- **RoO Value-Added Engine** with instant eligibility status 📊
- **Compliance Assessments** tracking per product/shipment 📋
- **Document Repository** for uploading and linking evidence 📂
- **Zuri AI Chat** – context-aware trade assistant (Gemini) 💬


### 📸 Project Demo

The following gallery showcases the core user interface and the end-to-end compliance journey within the application.

<div align="center">
<table>
<tr>
<td width="50%">
<img src="pages\summary-dashboard.png" alt="Main Dashboard" /><br />
<sub><b>1. Main Dashboard:</b> Real-time trade connectivity and activity overview.</sub>
</td>
<td width="50%">
<img src="pages\shipment-details.png" alt="RoO Calculator" /><br />
<sub><b>2. Shipment details:</b> Inputting costs for Ad Valorem eligibility.</sub>
</td>
</tr>
<tr>
<td width="50%">
<img src="pages\trade-action-3.png" alt="Compliance Tracker" /><br />
<sub><b>3. Compliance Tracker:</b> Step-by-step document verification journey.</sub>
</td>
<td width="50%">
<img src="pages\AI-trade-chat.png" alt="Zuri AI Consultant" /><br />
<sub><b>4. Zuri AI:</b> Context-aware trade consulting and support.</sub>
</td>
</tr>
<tr>
<td colspan="2" align="center">
<img src="pages\document.png" alt="Document Repository" width="50%" /><br />
<sub><b>5. Document Repository:</b> Professional management of verified evidence.</sub>
</td>
</tr>
</table>
</div>

---

## 3. Tech Stack 🧰

- <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /> — UI screens and components.
- <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /> — Dev server + production build.
- <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /> — Styling and layout.
- <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router" /> — Client-side routing.

- <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" /> — Backend language.
- <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /> — REST API framework.
- <img src="https://img.shields.io/badge/Uvicorn-0F172A?style=for-the-badge" alt="Uvicorn" /> — ASGI server.
- <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge" alt="SQLAlchemy" /> — ORM for database access.
- <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" /> — Demo database.

- <img src="https://img.shields.io/badge/JWT-111827?style=for-the-badge" alt="JWT" /> — Token-based sessions.
- <img src="https://img.shields.io/badge/python--jose-111827?style=for-the-badge" alt="python-jose" /> — JWT signing/verification.
- <img src="https://img.shields.io/badge/bcrypt-111827?style=for-the-badge" alt="bcrypt" /> — Password hashing (via `passlib`).

- <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" /> — Powers the Zuri assistant endpoint.
- <img src="https://img.shields.io/badge/httpx-111827?style=for-the-badge" alt="httpx" /> — HTTP client for integrations.

---

## 4. Getting Started 🏁

### Prerequisites
- **Git**
- **Node.js 18+** (npm included)
- **Python 3.11+**

### Installation
Clone the repository:
```bash
git clone https://github.com/Bini-2002/afri-verify.git
cd afri-verify
```

### Backend Setup (FastAPI)
From the `server/` folder:

```powershell
cd server
python -m venv .venv
.
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt --default-timeout=180
```

Create your environment file:
- Copy `server/.env.example` → `server/.env`
- Set at least `SECRET_KEY`
- (Optional) set `GEMINI_API_KEY` to enable the Zuri AI endpoint

Run the API:
```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

You can verify the server is up at:
- `http://127.0.0.1:8000/`

### Frontend Setup (React)
From the `client/` folder:
```powershell
cd ..\client
npm install
npm run dev
```

Open the app at:
- `http://localhost:5173/`

### Quick Auth Test (JWT)
With the API running:
```powershell
cd ..\server
powershell -ExecutionPolicy Bypass -File .\scripts\smoke_auth.ps1
```

### Notes
- **SQLite schema changes:** the backend uses `create_all()` (no migrations). For a clean run after model changes, delete `server/afriverify.db` and restart the server.

---

## 5. Contributing & Issues 🤝

Contributions, bug reports, and feature ideas are welcome.

### How to Contribute
- **Fork the repo** and create a feature branch.
- Keep PRs focused (one feature/fix per PR) and include a short description + screenshots if UI changes.
- If your change affects the API contract, update the README/docs accordingly.

Suggested workflow:
1) Open an issue describing what you want to change.
2) Submit a Pull Request referencing the issue.

### Reporting Issues / Requesting Features
- Use **GitHub Issues** to report bugs, request features, or suggest improvements.
- Include:
	- Steps to reproduce
	- Expected vs actual behavior
	- Screenshots/logs (if applicable)
	- Your OS, Node version, and Python version

### Code of Conduct
This project aims to be welcoming and inclusive. Please be respectful in issues and PR discussions.

---

## 6. Conclusion 🙏

Thanks for checking out **AfriVerify**. If you find this project useful for AfCFTA compliance workflows (or want to build on it), please consider starring the repository and sharing feedback via Issues.

## 7. License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE).


