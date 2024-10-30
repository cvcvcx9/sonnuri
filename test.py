from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_items():
    return 200

# 서버 실행
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)