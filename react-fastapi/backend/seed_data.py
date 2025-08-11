from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    try:
        # Check if items already exist
        existing_items = db.query(models.Item).first()
        if existing_items:
            print("Database already has data. Skipping seed.")
            return
        
        # Create sample items
        sample_items = [
            models.Item(
                name="Welcome Item",
                description="This is a sample item to demonstrate the app functionality"
            ),
            models.Item(
                name="Grocery List",
                description="Remember to buy milk, eggs, and bread"
            ),
            models.Item(
                name="Meeting Notes",
                description="Discuss project timeline and requirements"
            ),
            models.Item(
                name="Book Recommendation",
                description="Clean Code by Robert Martin - great for developers"
            ),
            models.Item(
                name="Weekend Plans",
                description="Visit the park, try the new restaurant downtown"
            ),
        ]
        
        for item in sample_items:
            db.add(item)
        
        db.commit()
        print("Database seeded with sample data!")
        print(f"Added {len(sample_items)} items to the database.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()