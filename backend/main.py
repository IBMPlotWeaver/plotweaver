from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PlotWeaver Backend")

# 1. Define the allowed origins (where your React app is running)
origins = [
    "http://localhost:5173",  
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# 2. Add the CORS middleware to your FastAPI application instance
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Allows requests from your React app
    allow_credentials=True,         # Allows cookies and authorization headers
    allow_methods=["*"],            # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],            # Allows all request headers
)

# 3. Create a sample route to test the connection
@app.get("/api/data")
async def get_data():
    return {
        "status": "success",
        "message": "Hello from the FastAPI backend!"
    }