from dotenv import load_dotenv
from pathlib import Path
import os, bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get('MONGO_URL', "mongodb://localhost:27017")
DB_NAME = os.environ.get('DB_NAME', "bgmi_marketplace")

def hash_pw(pw: str): return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Update admin@bgmihub.com
    await db.users.update_one(
        {"email": "admin@bgmihub.com"},
        {"$set": {
            "password_hash": hash_pw("admin123"),
            "phone": "9876543210"
        }}
    )
    
    # Update admin@bgmi.com (already has password, just make sure)
    await db.users.update_one(
        {"email": "admin@bgmi.com"},
        {"$set": {
            "password_hash": hash_pw("admin123")
        }}
    )
    
    print("Admin accounts fixed!")
    print("Both admins can now login with password: admin123")
    print("\n1. Email: admin@bgmihub.com")
    print("2. Email: admin@bgmi.com")

asyncio.run(main())
