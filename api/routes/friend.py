from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.supabase import supabase
from utils.auth import get_current_user

router = APIRouter()

class AddFriendRequest(BaseModel):
    user_id: int

@router.post("/add")
async def add_friend(data: AddFriendRequest, current_user: dict = Depends(get_current_user)):
    # 检查对方用户是否存在
    target_user = supabase.table("users").select("*").eq("id", data.user_id).execute()
    if not target_user.data:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 检查是否已经是好友
    existing_friend = supabase.table("friends").select("*").eq("user_id", current_user["id"]).eq("friend_id", data.user_id).execute()
    if existing_friend.data:
        raise HTTPException(status_code=400, detail="已经是好友")
    
    # 创建好友关系
    friend_data = {
        "user_id": current_user["id"],
        "friend_id": data.user_id,
        "affection": 0,
        "is_info_public": False
    }
    
    result = supabase.table("friends").insert(friend_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="添加好友失败")
    
    return {
        "message": "添加好友成功",
        "friend": result.data[0]
    }

@router.get("/list")
async def get_friends(current_user: dict = Depends(get_current_user)):
    # 获取好友列表
    friends = supabase.table("friends").select("*").eq("user_id", current_user["id"]).execute()
    
    # 获取好友详细信息
    friend_list = []
    for friend in friends.data:
        friend_info = supabase.table("users").select("id, nickname, gender, avatar").eq("id", friend["friend_id"]).execute()
        if friend_info.data:
            friend_data = friend_info.data[0]
            friend_data["affection"] = friend["affection"]
            friend_data["is_info_public"] = friend["is_info_public"]
            friend_list.append(friend_data)
    
    return friend_list

@router.put("/public-info/{friend_id}")
async def public_info(friend_id: int, current_user: dict = Depends(get_current_user)):
    # 检查好友关系是否存在
    friend = supabase.table("friends").select("*").eq("user_id", current_user["id"]).eq("friend_id", friend_id).execute()
    if not friend.data:
        raise HTTPException(status_code=404, detail="好友关系不存在")
    
    # 更新是否公开信息
    result = supabase.table("friends").update({"is_info_public": True}).eq("user_id", current_user["id"]).eq("friend_id", friend_id).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="操作失败")
    
    return {
        "message": "公开信息成功",
        "is_info_public": True
    }

@router.get("/detail/{friend_id}")
async def get_friend_detail(friend_id: int, current_user: dict = Depends(get_current_user)):
    # 检查好友关系是否存在
    friend = supabase.table("friends").select("*").eq("user_id", current_user["id"]).eq("friend_id", friend_id).execute()
    if not friend.data:
        raise HTTPException(status_code=404, detail="好友关系不存在")
    
    # 获取好友详细信息
    if friend.data[0]["is_info_public"]:
        # 公开信息
        friend_info = supabase.table("users").select("*").eq("id", friend_id).execute()
    else:
        # 非公开信息，只返回基本信息
        friend_info = supabase.table("users").select("id, nickname, gender, avatar").eq("id", friend_id).execute()
    
    if not friend_info.data:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return friend_info.data[0]