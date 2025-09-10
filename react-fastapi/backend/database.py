from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://deploy_0a18210c_owner:npg_MUWoETy37nZu@ep-round-sunset-a1rarwou-pooler.ap-southeast-1.aws.neon.tech/env_be070186_deploy_0a18210c?channel_binding=require&sslmode=require")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()