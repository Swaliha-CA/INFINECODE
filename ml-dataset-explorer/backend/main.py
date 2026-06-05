from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3

app = FastAPI(title="ML Dataset Explorer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "datasets.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS datasets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            type TEXT NOT NULL,
            rows INTEGER NOT NULL,
            features INTEGER NOT NULL,
            status TEXT DEFAULT 'Not Explored'
        )
    """)
    try:
        conn.execute("""
            INSERT INTO datasets (name, description, type, rows, features, status) VALUES 
            ('Iris Dataset', 'Classic flower classification dataset with 3 species', 'Tabular', 150, 4, 'Ready for Training'),
            ('MNIST Handwritten Digits', 'Grayscale images of handwritten digits 0-9', 'Image', 70000, 784, 'Trained'),
            ('IMDB Movie Reviews', 'Sentiment analysis dataset with positive/negative labels', 'Text', 50000, 1, 'Exploring'),
            ('UrbanSound8K', 'Urban audio clips classified into 10 categories', 'Audio', 8732, 193, 'Not Explored')
        """)
        conn.commit()
    except:
        pass
    conn.close()

init_db()

class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    type: str
    rows: int
    features: int
    status: Optional[str] = "Not Explored"

class DatasetUpdate(BaseModel):
    description: Optional[str] = None
    type: Optional[str] = None
    rows: Optional[int] = None
    features: Optional[int] = None
    status: Optional[str] = None

class Dataset(BaseModel):
    id: int
    name: str
    description: Optional[str]
    type: str
    rows: int
    features: int
    status: str

def row_to_dict(row):
    return dict(row)

@app.get("/datasets", response_model=List[Dataset])
def get_all_datasets(search: Optional[str] = None):
    conn = get_db()
    if search:
        rows = conn.execute("SELECT * FROM datasets WHERE name LIKE ? ORDER BY id DESC", (f"%{search}%",)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM datasets ORDER BY id DESC").fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

@app.get("/datasets/stats")
def get_stats():
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM datasets").fetchone()[0]
    tabular = conn.execute("SELECT COUNT(*) FROM datasets WHERE type='Tabular'").fetchone()[0]
    image = conn.execute("SELECT COUNT(*) FROM datasets WHERE type='Image'").fetchone()[0]
    text = conn.execute("SELECT COUNT(*) FROM datasets WHERE type='Text'").fetchone()[0]
    audio = conn.execute("SELECT COUNT(*) FROM datasets WHERE type='Audio'").fetchone()[0]
    conn.close()
    return {"total": total, "tabular": tabular, "image": image, "text": text, "audio": audio}

@app.get("/datasets/{dataset_id}", response_model=Dataset)
def get_dataset(dataset_id: int):
    conn = get_db()
    row = conn.execute("SELECT * FROM datasets WHERE id=?", (dataset_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return row_to_dict(row)

@app.post("/datasets", response_model=Dataset, status_code=201)
def create_dataset(dataset: DatasetCreate):
    conn = get_db()
    try:
        cursor = conn.execute(
            "INSERT INTO datasets (name, description, type, rows, features, status) VALUES (?,?,?,?,?,?)",
            (dataset.name, dataset.description, dataset.type, dataset.rows, dataset.features, dataset.status)
        )
        conn.commit()
        row = conn.execute("SELECT * FROM datasets WHERE id=?", (cursor.lastrowid,)).fetchone()
        conn.close()
        return row_to_dict(row)
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail="Dataset with this name already exists")

@app.put("/datasets/{dataset_id}", response_model=Dataset)
def update_dataset(dataset_id: int, update: DatasetUpdate):
    conn = get_db()
    row = conn.execute("SELECT * FROM datasets WHERE id=?", (dataset_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Dataset not found")
    data = row_to_dict(row)
    if update.description is not None: data["description"] = update.description
    if update.type is not None: data["type"] = update.type
    if update.rows is not None: data["rows"] = update.rows
    if update.features is not None: data["features"] = update.features
    if update.status is not None: data["status"] = update.status
    conn.execute(
        "UPDATE datasets SET description=?, type=?, rows=?, features=?, status=? WHERE id=?",
        (data["description"], data["type"], data["rows"], data["features"], data["status"], dataset_id)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM datasets WHERE id=?", (dataset_id,)).fetchone()
    conn.close()
    return row_to_dict(row)

@app.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: int):
    conn = get_db()
    row = conn.execute("SELECT * FROM datasets WHERE id=?", (dataset_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Dataset not found")
    conn.execute("DELETE FROM datasets WHERE id=?", (dataset_id,))
    conn.commit()
    conn.close()
    return {"message": "Dataset deleted successfully"}
