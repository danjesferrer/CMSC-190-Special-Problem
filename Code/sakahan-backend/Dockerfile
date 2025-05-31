# Stage 1: Builder
FROM python:3.13-slim AS builder

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies required for psycopg2
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    make \
    libpq-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the requirements file and install dependencies
COPY requirements.txt . 
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: Final Image
FROM python:3.13-slim

# Set the working directory
WORKDIR /app

# Set environment variables for build time
ARG DJANGO_SECRET_KEY AWS_SES_ACCESS_KEY_ID AWS_SES_SECRET_ACCESS_KEY AWS_SES_REGION_NAME \
    AWS_SES_FROM_EMAIL DOMAIN GOOGLE_AUTH_KEY GOOGLE_AUTH_SECRET_KEY REDIRECT_URLS \
    AWS_S3_ACCESS_KEY_ID AWS_S3_SECRET_ACCESS_KEY AWS_STORAGE_BUCKET_NAME AWS_S3_REGION_NAME \
    AWS_S3_CUSTOM_DOMAIN DATABASE_URL DJANGO_ALLOWED_HOSTS CORS_ALLOWED_ORIGINS

# Create a non-root user and set permissions
RUN useradd -m -r appuser && \
    chown -R appuser /app

# Copy installed Python packages from the builder image
COPY --from=builder /usr/local/lib/python3.13/site-packages/ /usr/local/lib/python3.13/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Install required geospatial libraries
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    binutils \
    libproj-dev \
    gdal-bin \
    libpq-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set environment variables for geospatial libraries
ENV LD_LIBRARY_PATH=/usr/local/lib

# Copy the application code to the container and set permissions
COPY --chown=appuser:appuser . .

# Prevents Python from writing pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1
# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1 

# Switch to the non-root user
USER appuser

# Collect static files
RUN python manage.py collectstatic --noinput

# Start the application using Gunicorn
CMD ["gunicorn", "--worker-tmp-dir", "/dev/shm", "sakahan_backend.wsgi"]
