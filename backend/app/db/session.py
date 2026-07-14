from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./test.db')
print("DATABASE_URL =", DATABASE_URL)


def _build_engine():
    if DATABASE_URL.startswith('sqlite'):
        return create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

    if DATABASE_URL.startswith(('postgresql://', 'postgres://')):
        try:
            import psycopg2  # noqa: F401
            engine = create_engine(DATABASE_URL)
            with engine.connect() as connection:
                connection.execute(text('SELECT 1'))
            return engine
        except (ModuleNotFoundError, SQLAlchemyError, OSError) as exc:
            print(f'Postgres unavailable ({exc}); falling back to sqlite for local startup.')
            return create_engine('sqlite:///./test.db', connect_args={"check_same_thread": False})

    return create_engine(DATABASE_URL)


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
