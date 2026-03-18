import os
import sys

# Add the current directory to sys.path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine, SessionLocal, Base
from app.models.models import User
from app.core import security

def init_db():
    print("Initializing Database...")
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if test user exists
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        print("Creating default test user: test@example.com")
        new_user = User(
            email="test@example.com",
            hashed_password=security.get_password_hash("Password123!"),
            name="Institutional Master"
        )
        db.add(new_user)
        db.commit()
        print("Database initialized successfully.")
    else:
        print("Test user already exists. Skipping initialization.")
    
    db.close()

if __name__ == "__main__":
    init_db()
