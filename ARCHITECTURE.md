# Architecture & Technical Design Note

## Executive Summary
This document details the architectural decisions, trade-offs, and technical design choices behind the **Ajaia Collaborative Document Editor**—a lightweight full-stack application inspired by Google Docs.

---

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                    │
│                                                             │
│   ┌───────────────┐   ┌────────────────┐   ┌────────────┐   │
│   │ Navbar & User │   │ Document List  │   │   TipTap   │   │
│   │   Switcher    │   │  & Dashboard   │   │   Editor   │   │
│   └───────┬───────┘   └───────┬────────┘   └─────┬──────┘   │
└───────────┼───────────────────┼──────────────────┼──────────┘
            │                   │                  │
            └───────────┬───────┴──────────────────┘
                        │ Axios API Requests (with X-User-Username Header)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Django REST Framework API                 │
│                                                             │
│   ┌───────────────────────┐    ┌────────────────────────┐   │
│   │ DemoHeaderAuth        │    │ File Import Engine     │   │
│   │ Middleware            │    │ (.txt, .md, .docx)     │   │
│   └───────────┬───────────┘    └───────────┬────────────┘   │
└───────────────┼────────────────────────────┼────────────────┘
                │                            │
                ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       SQLite Database                       │
│                                                             │
│    ┌──────────────┐    ┌───────────────┐   ┌────────────┐   │
│    │ Document     │    │ DocumentShare │   │ Attachment │   │
│    └──────────────┘    └───────────────┘   └────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Technical Decisions & Trade-offs

### 1. Authentication & Permission Strategy
- **Decision**: Implemented a header-based user context switcher (`X-User-Username`) backed by DRF `DemoHeaderAuthentication`.
- **Rationale**: For an evaluation/product assignment, traditional multi-step registration and login flows create heavy friction for reviewers. The user switcher allows evaluators to toggle instantly between seeded personas (**Alice**, **Bob**, **Charlie**) and observe real-time permission shifts (e.g. view-only vs. edit access, owned vs. shared views) in a single browser window.
- **Trade-off**: Replaced session cookies with explicit headers for simplicity. In an enterprise production setting, this would be backed by OAuth2 / JWT or Django Session cookies with CSRF protection.

### 2. Rich Text Storage & Editor Engine
- **Decision**: Paired **TipTap** (`@tiptap/react`) on the frontend with sanitized HTML string persistence in SQLite.
- **Rationale**: TipTap outputs clean, modern semantic HTML out of the box (`<p>`, `<h1>`, `<ul>`, `<u>`, `<strong>`, `<em>`). Storing standard HTML strings in SQLite provides maximum compatibility for preview truncation in document cards, search filtering (`icontains`), and file conversion export engines.
- **Trade-off**: Storing raw HTML instead of an abstract syntax tree (AST) like Slate's JSON or Yjs CRDT binary deltas simplifies single-user editing and file importing, though true real-time character-by-character Operational Transformation (OT) / CRDT would require WebSocket synchronization.

### 3. Server-Side File Import Processing
- **Decision**: Performed document parsing on the backend (`docs/utils.py`) using `python-docx` for Word documents and `markdown` for `.md` files.
- **Rationale**: Offloading file parsing to Python guarantees reliable, sandboxed conversion without browser memory limits or heavy client-side parsing bundles.
- **Trade-off**: File uploads require a server roundtrip, but result in fully validated, durable database records and optional raw file attachments.

### 4. Database & Storage Architecture
- **Decision**: Utilized SQLite with relational constraints (`Document`, `DocumentShare`, `DocumentAttachment`).
- **Rationale**: SQLite requires zero external database server setup, runs natively in Django, and provides instant portability for local evaluation and automated testing.
- **Data Integrity**: Enforced unique constraints on `(document, shared_with)` pairs to prevent duplicate access records and foreign key cascading deletion when documents are removed.

---

## Automated Verification & Testing Plan
- **Test Suite**: Built with Django's TestCase runner (`python manage.py test docs`).
- **Coverage**:
  - Document creation, inline title editing, and content update persistence.
  - Granular access control verification (Owner full access, Shared user edit permission, View-only enforcement, and 403 Forbidden for unshared users).
  - Multi-format file import parsing logic for plain text and markdown.
