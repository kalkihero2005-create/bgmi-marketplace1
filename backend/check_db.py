from dotenv import load_dotenv
from pathlib import Path
import os
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get('MONGO_URL', "mongodb://localhost:27017")
DB_NAME = os.environ.get('DB_NAME', "bgmi_marketplace")

async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=== Users ===")
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
    for user in users:
        print(user)
    
    print("\n=== Listings ===")
    listings = await db.listings.find({}, {"_id": 0}).to_list(100)
    for listing in listings:
        print(listing)

asyncio.run(main())
