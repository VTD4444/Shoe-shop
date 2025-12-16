import sys
import os
import traceback
import joblib
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))


sys.path.append(CURRENT_DIR)


try:
    from model_core import ShoeToxicModel
except ImportError as e:
    print("LỖI NGHIÊM TRỌNG: Python không tìm thấy file model_core.py")
    print(f" Python đang tìm ở: {sys.path}")
    raise e


BASE_DIR = os.path.dirname(CURRENT_DIR)

MODEL_PATH = os.path.join(BASE_DIR, "models", "shoe_toxic_v3.pkl")

print(f"📂 Server khởi động...")
print(f"👉 Code đang chạy tại: {CURRENT_DIR}")
print(f"👉 Đang tìm model tại: {MODEL_PATH}")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None

if os.path.exists(MODEL_PATH):
    print(f"✅ Tìm thấy file model. Đang load...")
    try:
        model = joblib.load(MODEL_PATH)
        print(" MODEL LOAD THÀNH CÔNG!")
    except Exception as e:
        print(" LOAD MODEL FAILED (File lỗi hoặc code model_core bị thay đổi)")
        print(" Error:", repr(e))
        traceback.print_exc()
else:
    print(f"⚠️ KHÔNG TÌM THẤY FILE MODEL TẠI: {MODEL_PATH}")
    models_dir = os.path.dirname(MODEL_PATH)
    if os.path.exists(models_dir):
        print(f"👀 Trong thư mục models có: {os.listdir(models_dir)}")



class CommentReq(BaseModel):
    text: str


@app.get("/")
def home():
    return {
        "status": "Toxic Shoe API is running",
        "model_loaded": model is not None,
        "current_dir": CURRENT_DIR
    }

@app.post("/predict")
def predict(req: CommentReq):
    if model is None:
        return {
            "text": req.text,
            "is_toxic": False,
            "score": 0.0,
            "message": "⚠️ Lỗi Server: Model chưa được load (Hãy chạy train trước).",
            "error": "Model not found"
        }

    try:
        label, score = model.predict(req.text)
        is_toxic = (label == 1)

        msg = "Bình luận hợp lệ."
        if is_toxic:
            if score >= 10:
                msg = "Ngôn từ thô tục/cấm kỵ!"
            else:
                msg = "Nội dung tiêu cực."

        return {
            "text": req.text,
            "is_toxic": is_toxic,
            "score": float(score),
            "message": msg
        }
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}