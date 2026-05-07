FROM python:3.11-slim
WORKDIR /app
COPY backend/pyproject.toml .
RUN pip install --no-cache-dir -e .
COPY backend/app/ app/
EXPOSE 10000
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}
