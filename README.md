# Ajaia Collaborative Document Editor

A lightweight full-stack collaborative document editor inspired by Google Docs, built with **Django REST Framework**, **SQLite**, and **React + Vite** with the **TipTap Rich Text Editor**.

---

## 🌟 Key Features

1. **Document Creation & Rich Text Editing**
   - Create, title, and edit documents in real-time.
   - Rich-text formatting toolbar: **Bold**, *Italic*, <u>Underline</u>, **Headings** (H1, H2, H3), **Bulleted Lists**, **Numbered Lists**, Undo / Redo.
   - Clean HTML persistence in SQLite database preserving all structure across refreshes.

2. **File Import & Attachments**
   - **Import files** (`.txt`, `.md`, `.docx`) directly into brand new editable documents.
   - Markdown headers (`#`, `**bold**`) and `.docx` paragraphs/headings are parsed automatically into rich text HTML.
   - Attach files directly to existing documents.

3. **Document Sharing & Access Control**
   - Share documents with other registered users (demo users: **Alice**, **Bob**, **Charlie**).
   - Permission control: Grant **Can Edit** (full edit rights) or **View Only** (read-only mode).
   - Clear visual badges distinguishing **Owned** vs. **Shared** documents.
   - **User Switcher UI**: Built-in header dropdown allows instantaneous user switching to test sharing workflows in real-time.

4. **Persistence & Engineering Quality**
   - Fully persisted database models in SQLite (`Document`, `DocumentShare`, `DocumentAttachment`).
   - Automated unit tests covering CRUD, permission enforcement, and file parsing.

---

## 🛠️ Tech Stack Overview

- **Backend**: Django 5.x, Django REST Framework, SQLite, `python-docx`, `markdown`, `django-cors-headers`, `gunicorn`, `whitenoise`.
- **Frontend**: React 19, Vite, `@tiptap/react` (StarterKit & Underline extension), `axios`, `lucide-react`.

---

## 🚀 Setup & Run Instructions

### 1. Backend Setup (Django)

```bash
cd backend

# Create & activate virtual environment (Windows PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Run Database Migrations
python manage.py makemigrations docs
python manage.py migrate

# Run Automated Unit Tests
python manage.py test docs

# Start Django Development Server
python manage.py runserver
```
*The backend API will be live at `http://127.0.0.1:8000/`.*

---

### 2. Frontend Setup (React + Vite)

Open a new terminal window:

```bash
cd frontend

# Install node dependencies
npm install

# Start Vite Development Server
npm run dev
```
*The React application will be live at `http://localhost:5173/`.*

---

## 🌐 Deploying to Render

We have included a `render.yaml` blueprint configuration in the repository root for seamless deployment to Render.

### Option A: Blueprint Deployment (Automatic)
1. Push your repository to GitHub / GitLab.
2. Log into [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Connect your repository. Render will automatically detect `render.yaml` and provision both the Django Backend Web Service and React Static Site!

### Option B: Manual Service Deployment

#### 1. Deploy Django Backend (Web Service)
- **Root Directory**: `backend`
- **Environment**: Python 3
- **Build Command**: `pip install -r requirements.txt && python manage.py migrate`
- **Start Command**: `gunicorn backend_project.wsgi:application`
- Render will assign a URL such as `https://ajaia-doc-backend.onrender.com`.

#### 2. Deploy React Frontend (Static Site)
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variable**: `VITE_API_BASE_URL` set to your backend API URL (e.g. `https://ajaia-doc-backend.onrender.com/api`).

---

## 🧪 Running Automated Tests

To execute the Django backend test suite:

```bash
cd backend
python manage.py test docs
```

The test suite validates:
- Document creation, title editing, and content persistence.
- Sharing permissions (Owner access, Edit permission, View-only enforcement, and Forbidden access for unshared users).
- File import parsing for `.md` and `.txt` files.

---

## 📄 Architecture Note & Trade-offs

### 1. Authentication Strategy
Rather than forcing login/registration forms that add friction to evaluating the product, we implemented a **Header-based User Switcher** (`X-User-Username`). The backend middleware automatically seeds and resolves users (`alice`, `bob`, `charlie`). This enables reviewers to switch between document owners and recipients in a single click to inspect sharing and permission behaviors instantly.

### 2. Rich Text Persistence
We chose **TipTap** on the frontend and stored standard clean HTML on the backend. This balances structured formatting preservation, ease of rendering preview snippets in document cards, and robust file import/export capabilities.

### 3. File Import Engine
The file import handler in `docs/utils.py` uses `python-docx` for `.docx` files and `markdown` for `.md` files to transform native file formats directly into TipTap-compatible HTML DOM nodes.

---

## 💡 Supported File Types
- **.txt**: Plain text files (converted to paragraph blocks).
- **.md**: Markdown files (converted to headings, bold text, lists, and line breaks).
- **.docx**: Microsoft Word documents (converted to headings and styled paragraphs).
