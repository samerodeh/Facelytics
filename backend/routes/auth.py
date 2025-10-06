from fastapi import APIRouter, HTTPException
from models.schemas import UserRegister, UserLogin, UserEmbeddings
from db.db import create_user, check_user, user_exists

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register")
async def register(user_data: UserRegister):
    # Check if user already exists
    if user_exists(user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    if create_user(user_data.username, user_data.email, user_data.password):
        return {"message": "User registered successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to create user")

@router.post("/login")
async def login(user_data: UserLogin):
    # Check user credentials
    user = check_user(user_data.email, user_data.password)
    if user:
        return {"message": "Login successful", "user": user}
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password") 
    
@router.delete("/forget_account")
async def delete_account(): 
    user = check_user(user_data.email, user_data.password)