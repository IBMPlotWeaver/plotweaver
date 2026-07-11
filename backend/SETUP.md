# Backend Setup Guide

This guide will help you set up the FastAPI backend for the Plotweaver project.

## Prerequisites

Make sure you have Python installed on your system.

## 1. Create a Virtual Environment

It's best practice to use a virtual environment to manage dependencies for this project.

Open your terminal, navigate to the `backend` directory, and run the following command:

```bash
python -m venv venv
```

This will create a new virtual environment named `venv` in the backend folder.

## 2. Activate the Virtual Environment

Before installing dependencies, you need to activate the virtual environment.

**On Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**On Windows (PowerShell):**
```powershell
venv\Scripts\Activate.ps1
```

**On macOS and Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` appear at the beginning of your terminal prompt, indicating that the virtual environment is active.

## 3. Install Dependencies

With the virtual environment active, install the required packages using `pip`. If a `requirements.txt` file is present, run:

```bash
pip install -r requirements.txt
```

If a `requirements.txt` file doesn't exist yet, you can install FastAPI and Uvicorn directly:

```bash
pip install fastapi "uvicorn[standard]"
```
And then save the installed dependencies:
```bash
pip freeze > requirements.txt
```

## 4. Run the Server

To start the FastAPI development server, run:

```bash
uvicorn main:app --reload
```
*(Note: Replace `main:app` with the correct filename and FastAPI instance name if different in this project.)*

The API will be available at `http://127.0.0.1:8000`. You can also access the interactive API documentation at `http://127.0.0.1:8000/docs`.
