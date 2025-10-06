#imports 

import psycopg2
import bcrypt

# postgres login

db_info = {
    "host": "localhost",
    "port": "5432",
    "dbname": "postgres",
    "user": "postgres",
    "password": "Ottawa2006?"
}

# create table

create_table_sql = """
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    person_name VARCHAR(100),
    embedding FLOAT8[]  -- Stores the face embedding as an array
);
"""

create_users_table_sql = """
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, 
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
)
"""


def create_table():
    try:
        conn = psycopg2.connect(**db_info)
        cursor = conn.cursor()
        cursor.execute(create_table_sql)
        cursor.execute(create_users_table_sql)
        print("✅ Tables 'embeddings' and 'users' created successfully.")
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print("❌ Error:", e)

create_table()


# insert embeddings

def insert_embedding(name, embedding):
    try:
        embedding = [float(x) for x in embedding]
        conn = psycopg2.connect(**db_info)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO embeddings (person_name, embedding) VALUES (%s, %s)",
            (name, embedding)
        )
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Embedding inserted for", name)
    except Exception as e:
        print("❌ Error inserting embedding:", e)


def create_user(username, email, password):
    try:
        conn = psycopg2.connect(**db_info)
        cursor = conn.cursor()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
            (username, email, password_hash)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error creating user: {e}")
        return False

def check_user(email, password):
    try:
        conn = psycopg2.connect(**db_info)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, username, email, password_hash FROM users WHERE email = %s",
            (email,)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        if user and bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
            return {"id": user[0], "username": user[1], "email": user[2]}
        return None
    except Exception as e:
        print(f"Error checking user: {e}")
        return None

def user_exists(email):
    try:
        conn = psycopg2.connect(**db_info)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return user is not None
    except Exception as e:
        print(f"Error checking if user exists: {e}")
        return False

def delete_embedding(person_name):
    # if embedding_exists(person_name):
    try:
        conn = psycopg2.connect(**db_info)
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM embeddings WHERE person_name = %s",
            (person_name,)
        )
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Embedding deleted for {person_name}")
    except Exception as e:
            print(f"❌ Error deleting embedding for {person_name}: {e}")

def update_embedding(person_name):
    try:
        conn = psycopg2.connect(**db_info)
        cursor= conn.cursor()
        cursor.execute(
            "UPDATE embeddings SET embedding = %s WHERE person_name = %s"
        )
        conn.comit()
        cursor.close()
        conn.close()
        print(f"embedding upadated for {person_name}")
    except Exception as e:
        print(f"❌ Error deleting embedding for {person_name}: {e}")

def embedding_exists(person_name):
    try:
        conn = psycopg2.connect(**db_info)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM embeddings WHERE person_name = %s", (person_name,))
        exists = cursor.fetchone() is not None
        cursor.close()
        conn.close()
        return exists
    except Exception as e:
        print(f"Error checking if embedding exists for {person_name}: {e}")
        return False

def list_embeddings():
    try:
        conn = psycopg2.connect(**db_info)
        cursor = conn.cursor()
        cursor.execute("SELECT id, person_name FROM embeddings ORDER BY id DESC")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return [{"id": r[0], "person_name": r[1]} for r in rows]
    except Exception as e:
        print(f"Error listing embeddings: {e}")
        return []