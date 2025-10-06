from PIL import Image
import numpy as np
from numpy import dot
from numpy.linalg import norm


from models.model import model

def get_embedding(image_path: str):
    img = np.array(Image.open(image_path).convert("RGB"))
    faces = model.get(img)
    if not faces:
        return None
    return faces[0].embedding.tolist()


def cosine_similarity(a, b):
    return dot(a, b) / (norm(a) * norm(b))

# face1_emb = get_embedding(file1)
# face2_emb = get_embedding(file2)

# if face1_emb is None or face2_emb is None:
#     print("❌ One or both images couldn't be read or no face detected.")
# else:
#     similarity = cosine_similarity(face1_emb, face2_emb)
#     print(f"Similarity: {similarity:.3f}")
#     if similarity > 0.6:
#         print("✅ Same person")
#     else:
#         print("❌ Different people")
