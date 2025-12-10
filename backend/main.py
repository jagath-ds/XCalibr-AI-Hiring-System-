# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import candidates, jobs, applications, analysis, hr_views, hr, admin,admin_dashboard
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="XCalibr AI Hiring System")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(candidates.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(analysis.router)
app.include_router(hr_views.router)
app.include_router(hr.router)
app.include_router(admin_dashboard.router)
@app.get("/")
def root():
    return {"message": "Backend is running"}