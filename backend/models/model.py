from insightface.app import FaceAnalysis

def load_model():
    app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
    app.prepare(ctx_id=0)
    return app

model = load_model()  




print("model type:", type(model))
print("model dir:", dir(model))