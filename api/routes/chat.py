from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.supabase import supabase
from utils.auth import get_current_user
from datetime import datetime

router = APIRouter()

class SendMessageRequest(BaseModel):
    friend_id: int
    content: str

class GiftRequest(BaseModel):
    friend_id: int
    gift_type: str
    hearts: int

@router.post("/send")
async def send_message(data: SendMessageRequest, current_user: dict = Depends(get_current_user)):
    # 检查好友关系是否存在
    friend = supabase.table("friends").select("*").eq("user_id", current_user["id"]).eq("friend_id", data.friend_id).execute()
    if not friend.data:
        raise HTTPException(status_code=404, detail="好友关系不存在")
    
    # 创建消息
    message_data = {
        "sender_id": current_user["id"],
        "receiver_id": data.friend_id,
        "content": data.content,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = supabase.table("messages").insert(message_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="消息发送失败")
    
    # 增加好感度（每条消息增加1点）
    new_affection = friend.data[0]["affection"] + 1
    supabase.table("friends").update({"affection": new_affection}).eq("user_id", current_user["id"]).eq("friend_id", data.friend_id).execute()
    
    return {
        "message": "消息发送成功",
        "data": result.data[0],
        "new_affection": new_affection
    }

@router.get("/history/{friend_id}")
async def get_chat_history(friend_id: int, current_user: dict = Depends(get_current_user)):
    # 检查好友关系是否存在
    friend = supabase.table("friends").select("*").eq("user_id", current_user["id"]).eq("friend_id", friend_id).execute()
    if not friend.data:
        raise HTTPException(status_code=404, detail="好友关系不存在")
    
    # 获取聊天历史
    messages = supabase.table("messages").select("*").or_(
        f"sender_id.eq.{current_user['id']},receiver_id.eq.{friend_id}",
        f"sender_id.eq.{friend_id},receiver_id.eq.{current_user['id']}"
    ).order("created_at", desc=False).execute()
    
    return messages.data

@router.post("/send-gift")
async def send_gift(data: GiftRequest, current_user: dict = Depends(get_current_user)):
    # 检查好友关系是否存在
    friend = supabase.table("friends").select("*").eq("user_id", current_user["id"]).eq("friend_id", data.friend_id).execute()
    if not friend.data:
        raise HTTPException(status_code=404, detail="好友关系不存在")
    
    # 检查心心数量是否足够
    if current_user["hearts"] < data.hearts:
        raise HTTPException(status_code=400, detail="心心数量不足")
    
    # 扣除心心
    supabase.table("users").update({"hearts": current_user["hearts"] - data.hearts}).eq("id", current_user["id"]).execute()
    
    # 增加好感度（礼物增加对应点数）
    affection_increase = data.hearts * 2  # 假设礼物价值是心心的2倍
    new_affection = friend.data[0]["affection"] + affection_increase
    supabase.table("friends").update({"affection": new_affection}).eq("user_id", current_user["id"]).eq("friend_id", data.friend_id).execute()
    
    # 记录礼物赠送
    gift_data = {
        "sender_id": current_user["id"],
        "receiver_id": data.friend_id,
        "gift_type": data.gift_type,
        "hearts": data.hearts,
        "affection_increase": affection_increase,
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("gifts").insert(gift_data).execute()
    
    return {
        "message": "礼物发送成功",
        "new_affection": new_affection,
        "remaining_hearts": current_user["hearts"] - data.hearts
    }

@router.get("/affection/{friend_id}")
async def get_affection(friend_id: int, current_user: dict = Depends(get_current_user)):
    # 检查好友关系是否存在
    friend = supabase.table("friends").select("*").eq("user_id", current_user["id"]).eq("friend_id", friend_id).execute()
    if not friend.data:
        raise HTTPException(status_code=404, detail="好友关系不存在")
    
    return {
        "affection": friend.data[0]["affection"]
    }