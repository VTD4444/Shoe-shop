import numpy as np
import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import VotingClassifier
from scipy.sparse import hstack

# ====================================
# 1. TỪ ĐIỂN DỮ LIỆU
# ====================================
TOXIC_STRONG = {
    'đm', 'vcl', 'vl', 'lồn', 'cặc', 'đéo', 'cc', 'cmm', 'đkm', 'cmnl', 'buồi',
    'vãi lồn', 'vãi cả lồn', 'địt mẹ', 'địt con mẹ', 'cứt', "địt", "đụ",
    'namkiki', 'backy', 'parky', 'nam kỳ', 'bắc kỳ', 'nam cầy', 'bắc cụ',
    'chịch', 'xoạc', 'bú lồn', 'bú cu', 'bú cặc', 'bú tý', 'hiếp', 'dâm',
    'cút', 'xéo', 'chết đi', 'súc vật', 'ngu học', 'thất học', 'lừa đảo', 'gian thương'
}

TOXIC_MEDIUM = {
    'ngu', 'đần', 'khùng', 'điên', 'chó', 'óc chó',
    'mất dạy', 'vô học', 'ngu người', 'ngớ ngẩn', 'mày', 'tao',
    'fake', 'pha ke', 'đểu', 'dỏm', 'nát'
}

POSITIVE_WORDS = {
    'cảm ơn', 'cám ơn', 'thanks', 'tốt', 'hay',
    'đẹp', 'yêu', 'thương', 'chúc', 'vui',
    'tuyệt', 'xuất sắc', 'tốt bụng', 'nhân hậu',
    'xịn', 'chất', 'êm', 'vừa vặn', 'giao nhanh', 'nhiệt tình', 'uy tín', 'legit'
}

SLANG_DICT = {
    "ko": "không", "k": "không", "kh": "không", "r": "rồi", "dc": "được",
    "vs": "với", "mn": "mọi người", "lun": "luôn", "bik": "biết", "bt": "biết",
    "j": "gì", "vcl": "vãi cả lồn", "vl": "vãi lồn", "đkm": "địt con mẹ",
    "đm": "địt mẹ", "cmm": "con mẹ mày", "cc": "cái cặc", "tk": "thằng",
    "loz": "lồn", "djt": "địt",
    "namkii": "nam kỳ chó", "backy": "bắc kỳ", "dcm": "địt con mẹ", "dm": "địt mẹ",
    "shop": "cửa hàng", "sp": "sản phẩm", "rep": "trả lời", "ship": "giao hàng"
}


# ====================================
# 2. CLASS XỬ LÝ CHÍNH (MODEL WRAPPER)
# ====================================
class ShoeToxicModel:
    def __init__(self):
        # TfidfVectorizer config
        self.tfidf = TfidfVectorizer(max_features=1200, ngram_range=(1, 2), min_df=2, max_df=0.8)

        # Voting Classifier (LR + SVM)
        self.model = VotingClassifier(estimators=[
            ('lr', LogisticRegression(C=1.0, class_weight='balanced', max_iter=1000)),
            ('svm', LinearSVC(C=0.5, class_weight='balanced', max_iter=2000))
        ], voting='hard')

    def clean_text(self, text):
        if not isinstance(text, str): return ""
        text = text.lower()
        text = re.sub(r'http\S+|www\S+', '', text)
        for k, v in SLANG_DICT.items():
            text = re.sub(r'\b' + re.escape(k) + r'\b', v, text)
        text = re.sub(r'(.)\1{2,}', r'\1\1', text)
        text = re.sub(r'[^\w\s,.!?]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text if text else "empty"

    def get_rule_score(self, text):
        # Hàm tính điểm rule
        text_lower = text.lower()
        strong_count = sum(1 for w in TOXIC_STRONG if w in text_lower)
        medium_count = sum(1 for w in TOXIC_MEDIUM if w in text_lower)
        positive_count = sum(1 for w in POSITIVE_WORDS if w in text_lower)

        score = (strong_count * 5) + (medium_count * 2) - (positive_count * 2)

        if text.isupper(): score += 1
        if text.count('!') >= 3: score += 1

        confidence = "LOW"
        if strong_count >= 1:
            confidence = "HIGH"
        elif medium_count >= 3:
            confidence = "MEDIUM"

        return score, confidence

    def extract_features(self, texts):
        # Hàm tạo features vector (Hybrid)
        tfidf_feats = self.tfidf.transform(texts)

        manual_feats = []
        for t in texts:
            score, _ = self.get_rule_score(t)
            text_lower = t.lower()
            feats = [
                score,
                sum(1 for w in TOXIC_STRONG if w in text_lower),
                sum(1 for w in TOXIC_MEDIUM if w in text_lower),
                sum(1 for w in POSITIVE_WORDS if w in text_lower),
                len(t),
                len(t.split()),
                int(any(w in text_lower for w in TOXIC_STRONG))
            ]
            manual_feats.append(feats)

        return hstack([tfidf_feats, np.array(manual_feats)])

    def fit(self, raw_texts, labels):
        # Train model
        cleaned_texts = [self.clean_text(t) for t in raw_texts]

        # Fit TFIDF trước
        self.tfidf.fit(cleaned_texts)

        # Transform và Train Voting Model
        X_final = self.extract_features(cleaned_texts)
        self.model.fit(X_final, labels)
        print("✅ Training complete inside wrapper!")

    def predict(self, raw_text):
        # Logic dự đoán Hybrid (QUAN TRỌNG: Logic ghép Rule + ML)
        cleaned = self.clean_text(raw_text)
        rule_score, confidence = self.get_rule_score(cleaned)

        # Lấy dự đoán từ ML
        features = self.extract_features([cleaned])
        ml_pred = self.model.predict(features)[0]

        final_pred = ml_pred

        # --- HYBRID LOGIC SHOP GIÀY ---
        # 1. Nếu Rule tốt (<=0) và độ tin cậy thấp (không có từ mạnh) -> thả (Feedback chê)
        if rule_score <= 0 and confidence == "LOW":
            final_pred = 0

        # 2. Nếu Rule bắt được từ mạnh -> CHẶN
        if confidence == "HIGH":
            final_pred = 1

        # 3. Nếu Rule cao và ML nghi ngờ -> CHẶN
        elif rule_score >= 4 and ml_pred == 1:
            final_pred = 1

        # 4. Override cứng
        if rule_score >= 6: final_pred = 1
        if rule_score <= -2: final_pred = 0  # Khen nhiều

        return int(final_pred), rule_score