from fastapi import APIRouter, Depends
from pydantic import BaseModel
from utils.supabase import supabase
from utils.auth import get_current_user

router = APIRouter()

class SearchRequest(BaseModel):
    gender: str = None
    age_min: int = None
    age_max: int = None
    province: str = None
    city: str = None

@router.post("/users")
async def search_users(data: SearchRequest, current_user: dict = Depends(get_current_user)):
    # 构建查询
    query = supabase.table("users").select("id, nickname, gender, age, province, city, avatar")
    
    # 添加筛选条件
    if data.gender:
        query = query.eq("gender", data.gender)
    
    if data.age_min:
        query = query.gte("age", data.age_min)
    
    if data.age_max:
        query = query.lte("age", data.age_max)
    
    if data.province:
        query = query.eq("province", data.province)
    
    if data.city:
        query = query.eq("city", data.city)
    
    # 排除自己
    query = query.neq("id", current_user["id"])
    
    # 执行查询
    result = query.execute()
    
    return result.data

@router.get("/provinces")
async def get_provinces():
    # 获取所有省份（从用户表中去重）
    provinces = supabase.table("users").select("province").distinct().execute()
    
    # 提取省份列表
    province_list = [p["province"] for p in provinces.data if p["province"]]
    
    return province_list

@router.get("/cities/{province}")
async def get_cities(province: str):
    # 获取指定省份的所有城市
    cities = supabase.table("users").select("city").eq("province", province).distinct().execute()
    
    # 提取城市列表
    city_list = [c["city"] for c in cities.data if c["city"]]
    
    return city_list