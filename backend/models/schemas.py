from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserDelete(BaseModel):
    email: EmailStr
    password: str


class UserEmbeddings(BaseModel):
    name: str
    embedding: list[float]
