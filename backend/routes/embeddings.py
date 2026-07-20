import logging
import os
import shutil
import uuid
from contextlib import contextmanager

import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from config import settings
from db.db import (
    delete_embedding as db_delete_embedding,
    embedding_exists,
    insert_embedding,
    list_embeddings,
    rename_embedding,
)
from utils.face import cosine_similarity, get_embedding

logger = logging.getLogger(__name__)
router = APIRouter(tags=["embeddings"])

TEMP_DIR = "temp_images"


@contextmanager
def saved_upload(file: UploadFile):
    """Persist an upload to a temp file and guarantee cleanup afterwards."""
    os.makedirs(TEMP_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1] or ".jpg"
    path = os.path.join(TEMP_DIR, f"{uuid.uuid4().hex}{ext}")
    try:
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        yield path
    finally:
        try:
            os.remove(path)
        except OSError:
            pass


@router.post("/create-embedding")
async def create_embedding(file: UploadFile = File(...), name: str = Form("unknown")):
    if embedding_exists(name):
        return {"success": False, "message": f"Embedding for '{name}' already exists"}

    with saved_upload(file) as path:
        embedding = get_embedding(path)

    if embedding is None:
        return {"success": False, "message": "No face detected"}

    insert_embedding(name, embedding)
    return {"success": True, "message": f"Embedding saved for '{name}'"}


@router.delete("/delete-embedding")
def delete_embedding(person_name: str):
    if db_delete_embedding(person_name):
        return {"success": True, "message": f"Embedding deleted for '{person_name}'"}
    return {"success": False, "message": f"No embedding found for '{person_name}'"}


@router.put("/update-embedding")
def update_embedding(person_name: str, new_person_name: str):
    if rename_embedding(person_name, new_person_name):
        return {"success": True, "message": f"Embedding renamed to '{new_person_name}'"}
    return {"success": False, "message": f"No embedding found for '{person_name}'"}


@router.post("/compare-faces")
async def compare_faces(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    with saved_upload(file1) as path1, saved_upload(file2) as path2:
        emb1 = get_embedding(path1)
        emb2 = get_embedding(path2)

    if emb1 is None or emb2 is None:
        return {"match": False, "message": "Face not detected in one or both images"}

    score = cosine_similarity(np.array(emb1), np.array(emb2))
    return {"match": bool(score > settings.face_match_threshold), "similarity": score}


@router.get("/embeddings")
def get_embeddings():
    return {"success": True, "embeddings": list_embeddings()}
