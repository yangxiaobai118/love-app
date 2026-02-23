from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, user, chat, friend, search
from utils.supabase import supabase

app = FastAPI(
    title="相亲征婚交友API",
    description="微信小程序后端API服务",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(user.router, prefix="/api/user", tags=["用户"])
app.include_router(friend.router, prefix="/api/friend", tags=["好友"])
app.include_router(chat.router, prefix="/api/chat", tags=["聊天"])
app.include_router(search.router, prefix="/api/search", tags=["搜索"])

@app.get("/")
async def root():
    return {"message": "相亲征婚交友API服务运行中"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)