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

print("MONGO_URL:", MONGO_URL)
print("DB_NAME:", DB_NAME)

def hash_pw(pw: str): return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

async def main():
    try:
        print("\nConnecting to MongoDB Atlas...")
        client = AsyncIOMotorClient(MONGO_URL)
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
        
        db = client[DB_NAME]
        
        # Check existing users
        print("\nExisting users:")
        users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
        for user in users:
            print(user)
        
        # Add admin@bgmi.com if not exists
        admin_email = "admin@bgmi.com"
        existing = await db.users.find_one({"email": admin_email})
        if not existing:
            user_id = str(uuid.uuid4())
            new_admin = {
                "id": user_id,
                "email": admin_email,
                "phone": "9876543210",
                "name": "Admin",
                "password_hash": hash_pw("admin123"),
                "role": "admin",
                "wallet_balance": 10000.0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(new_admin)
            print(f"\n✅ Added admin user: {admin_email}")
        else:
            print(f"\n✅ Admin {admin_email} already exists!")
        
        print("\nAll done!")
    except Exception as e:
        print(f"\n❌ Error: {e}")

asyncio.run(main())
