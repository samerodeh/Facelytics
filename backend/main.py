# fastapi imports

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os

# files imports

from db import db
from routes import embeddings, auth
from utils import face

app = FastAPI(
    title="Face Detection API",
    description="API for face detection and user authentication",
    version="1.0.0"
)

# Include routers
app.include_router(auth.router)
app.include_router(embeddings.router)



# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




