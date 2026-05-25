from dotenv import load_dotenv
from pathlib import Path
import os, uuid, bcrypt
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', "bgmi_marketplace")

def hash_pw(pw: str): return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("Connecting to MongoDB Atlas...")
    
    # Admin 1: admin@bgmihub.com
    admin1 = await db.users.find_one({"email": "admin@bgmihub.com"})
    if not admin1:
        user_id = str(uuid.uuid4())
        new_admin = {
            "id": user_id,
            "email": "admin@bgmihub.com",
            "phone": "9876543210",
            "name": "Admin",
            "password_hash": hash_pw("admin123"),
            "role": "admin",
            "wallet_balance": 10000.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_admin)
        print("Created admin@bgmihub.com")
    
    # Admin 2: admin@bgmi.com
    admin2 = await db.users.find_one({"email": "admin@bgmi.com"})
    if not admin2:
        user_id = str(uuid.uuid4())
        new_admin = {
            "id": user_id,
            "email": "admin@bgmi.com",
            "phone": "9876543210",
            "name": "Admin",
            "password_hash": hash_pw("admin123"),
            "role": "admin",
            "wallet_balance": 10000.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_admin)
        print("Created admin@bgmi.com")
    
    print("\n=== All Users in Atlas ===")
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
    for user in users:
        print(user)

asyncio.run(main())
