from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv

from .database import init_db
from .api.authenticationroute import router as auth_router
from .api.calculationroute import router as calc_router
from .api.DocumentAIroute import router as docs_router
from .api.dashboardroute import router as dashboard_router
from .api.ragroute import router as rag_router
from .api.usersroute import router as users_router

app = FastAPI()

# Local/dev convenience: load server/.env if present.
# This does not override already-set environment variables.
load_dotenv()

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(calc_router)
app.include_router(docs_router)
app.include_router(dashboard_router)
app.include_router(rag_router)
app.include_router(users_router)

@app.get("/")
def home():
    return {"status": "AU Business Engine Online"}