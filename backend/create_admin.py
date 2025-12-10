# create_admin.py
import sys
import os

# Add the project root to the Python path to allow imports
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from database import sessionLocal, engine
import models
from security import get_password_hash

# --- New Admin Details ---
NEW_ADMIN_EMAIL = "email"
NEW_ADMIN_PASS = "pass"

def create_admin_user():
    db = sessionLocal()
    try:
        # Check if user already exists
        existing_admin = db.query(models.Admin).filter(models.Admin.email == NEW_ADMIN_EMAIL).first()
        if existing_admin:
            print(f"Admin with email '{NEW_ADMIN_EMAIL}' already exists.")
            return

        # Hash the password 
        hashed_password = get_password_hash(NEW_ADMIN_PASS)

        # Create new admin
        new_admin = models.Admin(
            firstname="fname",
            lastname="lname",
            email=NEW_ADMIN_EMAIL,
            pass_word=hashed_password,
            organization="org name",
            permissions="define permission(eg:all)"
        )
        
        db.add(new_admin)
        db.commit()
        
        print(f"Successfully created new admin user: {NEW_ADMIN_EMAIL}")
        print(f"Password: {NEW_ADMIN_PASS}")

    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # This ensures your tables are created if they don't exist
    models.Base.metadata.create_all(bind=engine)
    create_admin_user()