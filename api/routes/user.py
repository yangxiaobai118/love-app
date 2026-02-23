from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.supabase import supabase
from utils.auth import get_current_user

router = APIRouter()

class UpdateUserRequest(BaseModel):
    nickname: str = None
    gender: str = None
    age: int = None
    province: str = None
    city: str = None
    avatar: str = None
    contact: str = None
    occupation: str = None
    height: float = None
    weight: float = None
    family: str = None

class RechargeRequest(BaseModel):
    amount: int

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/update")
async def update_user(data: UpdateUserRequest, current_user: dict = Depends(get_current_user)):
    # 准备更新数据
    update_data = {}
    for key, value in data.dict().items():
        if value is not None:
            update_data[key] = value
    
    if not update_data:
        raise HTTPException(status_code=400, detail="无更新数据")
    
    # 更新用户信息
    result = supabase.table("users").update(update_data).eq("id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="更新失败")
    
    return result.data[0]

@router.post("/recharge")
async def recharge(data: RechargeRequest, current_user: dict = Depends(get_current_user)):
    # 计算心心数量（1元=10心心）
    hearts = data.amount * 10
    
    # 更新用户心心数量
    result = supabase.table("users").update({"hearts": current_user["hearts"] + hearts}).eq("id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="充值失败")
    
    return {
        "message": "充值成功",
        "hearts": result.data[0]["hearts"]
    }

@router.post("/watch-ad")
async def watch_ad(current_user: dict = Depends(get_current_user)):
    # 检查今日是否已达到观看广告上限（每日3次）
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # 这里需要在数据库中记录用户每日观看广告次数
    # 简化处理，实际项目中需要创建相关表
    
    # 增加好感度（观看广告增加5点）
    result = supabase.table("users").update({"hearts": current_user["hearts"] + 5}).eq("id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="操作失败")
    
    return {
        "message": "观看广告成功",
        "hearts": result.data[0]["hearts"]
    }