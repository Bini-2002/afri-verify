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

| Frontend (client/) 📱                                                             | Backend (server/) 🛠️                                                             |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| - **JavaScript + React 19**: Builds the interactive UI (auth screens, dashboard, calculator, documents, and chat pages).<br><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /><br>- **Vite**: Fast development server + production bundling.<br>- **Tailwind CSS 4**: Utility-first styling system for consistent UI design.<br><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" /><br>- **React Router 7**: Client-side routing (public pages vs authenticated `/app/*` pages). | - **Python + FastAPI**: REST API layer for authentication, profiles, assessments, and document operations.<br><img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /><br><img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" /><br>- **Uvicorn**: ASGI server used to run FastAPI locally and in deployment.<br>- **SQLAlchemy + SQLite**: ORM + database persistence for users, compliance assessments, and documents.<br><img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge" alt="SQLAlchemy" /><br><img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" /> |

| Security & Auth 🔒                                                                | AI / Integrations 🤖                                                              |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| - **python-jose**: JWT signing/verification for secure token-based sessions.<br>- **passlib[bcrypt]**: Password hashing and verification. | - **google-generativeai (Gemini)**: Powers the Zuri assistant endpoint for trade guidance.<br><img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" /><br>- **httpx**: HTTP client for OAuth token exchange and external API calls. |

---

