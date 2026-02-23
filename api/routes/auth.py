from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.supabase import supabase
from utils.jwt import create_access_token
import httpx
import os

router = APIRouter()

class RegisterRequest(BaseModel):
    nickname: str
    gender: str
    age: int = None
    province: str = None
    city: str = None
    avatar: str = None
    contact: str = None
    occupation: str = None
    height: float = None
    weight: float = None
    family: str = None

class LoginRequest(BaseModel):
    code: str

class WechatLoginResponse(BaseModel):
    openid: str
    session_key: str
    unionid: str = None

@router.post("/register")
async def register(data: RegisterRequest):
    # 检查用户是否已存在
    existing_user = supabase.table("users").select("*").eq("nickname", data.nickname).execute()
    if existing_user.data:
        raise HTTPException(status_code=400, detail="用户已存在")
    
    # 创建新用户
    user_data = {
        "nickname": data.nickname,
        "gender": data.gender,
        "age": data.age,
        "province": data.province,
        "city": data.city,
        "avatar": data.avatar,
        "contact": data.contact,
        "occupation": data.occupation,
        "height": data.height,
        "weight": data.weight,
        "family": data.family,
        "hearts": 0
    }
    
    result = supabase.table("users").insert(user_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="用户创建失败")
    
    # 生成token
    access_token = create_access_token(data={"sub": str(result.data[0]["id"])})
    
    return {
        "user": result.data[0],
        "access_token": access_token
    }

@router.post("/login")
async def login(data: LoginRequest):
    # 调用微信登录接口
    WECHAT_APPID = os.getenv("WECHAT_APPID")
    WECHAT_SECRET = os.getenv("WECHAT_SECRET")
    
    url = f"https://api.weixin.qq.com/sns/jscode2session?appid={WECHAT_APPID}&secret={WECHAT_SECRET}&js_code={data.code}&grant_type=authorization_code"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        result = response.json()
    
    if "errcode" in result:
        raise HTTPException(status_code=400, detail="微信登录失败")
    
    # 检查用户是否已存在
    existing_user = supabase.table("users").select("*").eq("openid", result["openid"]).execute()
    
    if not existing_user.data:
        # 创建新用户
        user_data = {
            "openid": result["openid"],
            "nickname": f"用户{result['openid'][:6]}",
            "gender": "未知",
            "hearts": 0
        }
        create_result = supabase.table("users").insert(user_data).execute()
        user = create_result.data[0]
    else:
        user = existing_user.data[0]
    
    # 生成token
    access_token = create_access_token(data={"sub": str(user["id"])})
    
    return {
        "user": user,
        "access_token": access_token
    }