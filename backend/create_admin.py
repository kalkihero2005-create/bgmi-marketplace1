from dotenv import load_dotenv
from pathlib import Path
import os, uuid, bcrypt
from datetime import datetime, timezone
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
    
    # Admin credentials
    admin_email = "admin@bgmi.com"
    admin_password = "admin123"  # Change this to your desired password!
    admin_name = "Admin"
    admin_phone = "9876543210"
    
    # Check if admin already exists
    existing = await db.users.find_one({"email": admin_email})
    if existing:
        print(f"Admin already exists with email {admin_email}")
        return
    
    user_id = str(uuid.uuid4())
    new_admin = {
        "id": user_id,
        "email": admin_email.lower(),
        "phone": admin_phone,
        "name": admin_name,
        "password_hash": hash_pw(admin_password),
        "role": "admin",
        "wallet_balance": 10000.0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(new_admin)
    print("Admin user created successfully!")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    print("Please change the password after first login!")

asyncio.run(main())
