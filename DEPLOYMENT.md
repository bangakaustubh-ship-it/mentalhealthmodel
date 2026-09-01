# 🚀 Deployment Guide - Mental Health Predictor

Complete guide to deploy your Mental Health Predictor application.

## 📋 Table of Contents
1. [Local Development](#local-development)
2. [Production Deployment](#production-deployment)
3. [Cloud Platforms](#cloud-platforms)
4. [Troubleshooting](#troubleshooting)

---

## 🏠 Local Development

### Quick Start
```bash
# 1. Navigate to project directory
cd MentalHealthPredictot

# 2. Install dependencies
pip install Flask flask-cors numpy pandas scikit-learn

# 3. Run the application
python app.py

# 4. Open browser
# Navigate to: http://localhost:5000
```

### Development Server
The Flask development server runs on:
- **Local**: http://127.0.0.1:5000
- **Network**: http://192.168.0.105:5000 (or your local IP)

---

## 🌐 Production Deployment

### Option 1: Heroku

**Prerequisites**: Heroku CLI installed

**Step 1: Create Required Files**

Create `Procfile`:
```
web: gunicorn app:app
```

Create `runtime.txt`:
```
python-3.12
```

Update `requirements.txt` to include:
```
gunicorn==21.2.0
```

**Step 2: Deploy**
```bash
# Initialize Git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create Heroku app
heroku create mental-health-predictor

# Deploy
git push heroku main

# Open app
heroku open
```

---

### Option 2: Render

**Step 1**: Create account at [render.com](https://render.com)

**Step 2**: Create `render.yaml`:
```yaml
services:
  - type: web
    name: mental-health-predictor
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: PYTHON_VERSION
        value: 3.12
```

**Step 3**: Connect your GitHub repository and deploy

---

### Option 3: PythonAnywhere

**Step 1**: Create account at [pythonanywhere.com](https://pythonanywhere.com)

**Step 2**: Upload files via Web interface or Git

**Step 3**: Configure Web App
- Python version: 3.12
- WSGI configuration file: point to `app.py`
- Static files: `/static/` → `/home/yourusername/MentalHealthPredictot/static/`

**Step 4**: Reload web app

---

### Option 4: AWS EC2

**Prerequisites**: AWS account and key pair

**Step 1: Launch EC2 Instance**
- AMI: Ubuntu Server 22.04 LTS
- Instance type: t2.micro (free tier)
- Security group: Allow HTTP (80), HTTPS (443), SSH (22)

**Step 2: Connect and Setup**
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3-pip python3-venv -y

# Clone or upload your project
git clone your-repo-url
cd MentalHealthPredictot

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn

# Install and configure Nginx
sudo apt install nginx -y
```

**Step 3: Configure Nginx**

Create `/etc/nginx/sites-available/mental-health`:
```nginx
server {
    listen 80;
    server_name your-domain-or-ip;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static {
        alias /home/ubuntu/MentalHealthPredictot/static;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mental-health /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Step 4: Run with Gunicorn**
```bash
gunicorn --bind 0.0.0.0:8000 app:app --daemon
```

---

### Option 5: Docker

**Step 1: Create Dockerfile**
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

**Step 2: Create docker-compose.yml**
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - ./static:/app/static
    environment:
      - FLASK_ENV=production
```

**Step 3: Build and Run**
```bash
docker-compose up -d
```

---

## 🔧 Environment Variables

For production, set these environment variables:

```bash
# Flask Configuration
export FLASK_ENV=production
export FLASK_DEBUG=0
export SECRET_KEY=your-secret-key-here

# Optional: Database (if you add one later)
export DATABASE_URL=your-database-url
```

---

## 🔒 Security Best Practices

### 1. Update Secret Key
Replace the hardcoded secret key in `app.py`:
```python
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key')
```

### 2. HTTPS
Always use HTTPS in production. Options:
- **Let's Encrypt** (free SSL certificates)
- **Cloudflare** (free SSL + CDN)
- Cloud platform SSL (most have built-in options)

### 3. Rate Limiting
Install Flask-Limiter:
```bash
pip install Flask-Limiter
```

Add to `app.py`:
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
```

### 4. CORS Configuration
Update CORS settings for production:
```python
CORS(app, resources={
    r"/*": {
        "origins": ["https://yourdomain.com"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

---

## 📊 Monitoring

### Application Monitoring
Consider adding:
- **Sentry** - Error tracking
- **Loggly** - Log management
- **New Relic** - Performance monitoring

### Example: Sentry Integration
```bash
pip install sentry-sdk[flask]
```

```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0
)
```

---

## 🐛 Troubleshooting

### Model Loading Error
**Issue**: `Error loading model: STACK_GLOBAL requires str`

**Solution**: The model was trained with a different scikit-learn version. Options:
1. Retrain the model with current version
2. Use the same scikit-learn version as training (1.6.1)
3. Add version compatibility handling

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <process-id> /F
```

### Static Files Not Loading
- Check `static` folder structure
- Verify file permissions
- Clear browser cache
- Check Flask static_url_path configuration

### Database Connection Issues
If you add a database later:
- Verify connection string
- Check firewall rules
- Ensure database service is running

---

## 🎯 Performance Optimization

### 1. Enable Caching
```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/api/stats')
@cache.cached(timeout=3600)  # Cache for 1 hour
def get_stats():
    # ...
```

### 2. Compress Responses
```bash
pip install Flask-Compress
```

```python
from flask_compress import Compress
Compress(app)
```

### 3. Optimize Static Files
- Minify CSS and JavaScript
- Compress images
- Use CDN for libraries (Font Awesome, etc.)

---

## 📝 Production Checklist

- [ ] Update SECRET_KEY to environment variable
- [ ] Set FLASK_ENV=production
- [ ] Set FLASK_DEBUG=0
- [ ] Configure CORS for your domain
- [ ] Enable HTTPS/SSL
- [ ] Add rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Configure logging
- [ ] Add health check endpoint
- [ ] Test all features in production environment
- [ ] Create database backups (if applicable)
- [ ] Document API endpoints
- [ ] Set up continuous deployment (CI/CD)

---

## 🆘 Support & Resources

### Documentation
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Scikit-learn](https://scikit-learn.org/)
- [Heroku Python Guide](https://devcenter.heroku.com/categories/python-support)

### Community
- [Stack Overflow - Flask Tag](https://stackoverflow.com/questions/tagged/flask)
- [Flask Discord](https://discord.gg/pallets)

---

**Last Updated**: September 2026

**Need Help?** Open an issue in the repository or contact the developer.
