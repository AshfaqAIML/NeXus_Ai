# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy only dependency files to leverage Docker cache
COPY packages/python-sdk/pyproject.toml packages/python-sdk/poetry.lock ./packages/python-sdk/
COPY services/chat/pyproject.toml services/chat/poetry.lock ./services/chat/

# Install dependencies without creating virtual environments (simpler for Docker)
RUN poetry config virtualenvs.create false \
    && cd packages/python-sdk && poetry install --no-dev --no-root \
    && cd ../../services/chat && poetry install --no-dev --no-root

# Stage 2: Runner
FROM python:3.11-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY packages ./packages
COPY services/chat ./services/chat

# Set working directory to the service
WORKDIR /app/services/chat

# Security: Run as non-root user
RUN useradd -m nexus
USER nexus

# Expose port
EXPOSE 8002

# Run application with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002", "--workers", "4"]