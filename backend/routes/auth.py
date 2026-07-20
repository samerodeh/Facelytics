from fastapi import APIRouter, HTTPException, status

from db.db import create_user, check_user, user_exists, delete_user
from models.schemas import UserRegister, UserLogin, UserDelete

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    if user_exists(user_data.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if create_user(user_data.username, user_data.email, user_data.password):
        return {"message": "User registered successfully"}
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user"
    )


@router.post("/login")
async def login(user_data: UserLogin):
    user = check_user(user_data.email, user_data.password)
    if user:
        return {"message": "Login successful", "user": user}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
    )


@router.delete("/forget_account")
async def delete_account(user_data: UserDelete):
    if delete_user(user_data.email, user_data.password):
        return {"message": "Account deleted successfully"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
    )
