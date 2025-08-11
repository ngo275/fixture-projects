from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    name: Optional[str] = None

class Item(ItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True