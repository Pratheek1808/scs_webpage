# Deployment Guide for Shashi Consulting Services

This guide explains how to deploy your landing page with its Python backend to **Render.com** (a popular platform with a free tier).

## Prerequisites
- A GitHub account.
- The project files must be in a Git repository pushed to GitHub.

## Steps

### 1. Push to GitHub
If you haven't already:
1. Create a repository on GitHub.
2. Initialize git in your `sashi-consulting` folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

### 2. Create a Web Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign up/login.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub account and select your repository.

### 3. Configure the Service
- **Name**: `sashi-consulting` (or any name you like)
- **Region**: Closest to you (e.g., Singapore, Oregon)
- **Branch**: `main`
- **Runtime**: **Python 3**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`
- **Instance Type**: **Free**

### 4. Deploy
1. Click **Create Web Service**.
2. Render will start building your app. This acts like a real server installation.
3. Once valid, you will get a URL like `https://shashi-consulting.onrender.com`.

### 5. Verify
- Visit the URL.
- Test the "Contact Us" form. It should submit successfully!

## Local Testing
To run this locally before deploying:
1. Open terminal in the `sashi-consulting` folder.
2. Install libraries: `pip install -r requirements.txt`
3. Run app: `python app.py`
4. Open `http://localhost:5000`
