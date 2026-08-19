# AI Workflow & Product Judgment Note

## Overview
This document details how AI assistance was leveraged during the development of the **Ajaia Collaborative Document Editor** assignment to achieve high development velocity while retaining full human ownership of product judgment, architectural decisions, and security constraints.

---

## 1. Product Judgment & Scope Prioritization

### Timebox Strategy (4-6 Hours Scope)
- **High-Value Capabilities Built**:
  - Full-featured document creation, title renaming, and rich-text editing (TipTap integration).
  - File import engine converting `.txt`, `.md`, and `.docx` directly into editable documents.
  - Multi-user document sharing model with granular permissions (`Can Edit` vs `View Only`).
  - Frictionless **User Switcher UI** to make evaluating sharing logic instant for reviewers.
  - Comprehensive automated unit tests for Django backend API.

- **Explicitly Omitted Out-of-Scope Bloat**:
  - Complex multi-step email verification login forms (replaced with user context header switcher to maximize reviewer productivity).
  - Heavy real-time WebSockets / Operational Transformation (prioritized durable REST API persistence and reliable clean formatting over complex OT edge cases within the timebox).

---

## 2. How AI Assistance Was Leveraged

### A. Rapid Boilerplate & Scaffolding (Velocity)
- **Used AI for**: Generating initial Django models, DRF serializers, TipTap editor extensions configuration, and CSS layout scaffolding.
- **Human Oversight**: Refined models to include strict relational constraints (`unique_together` on shares), customized serializer methods for dynamic permissions (`is_owner`, `permission`), and structured clean responsive CSS styling.

### B. File Parsing Engine & Data Parsing (Technical Problem Solving)
- **Used AI for**: Drafting parsing logic in `docs/utils.py` for extracting text nodes from `.docx` paragraphs and converting markdown trees into semantic HTML.
- **Human Oversight**: Added fallback exceptions and HTML escaping safeguards (`html.escape`) to prevent XSS vulnerability vectors when loading external uploaded files.

### C. Deployment & Environment Configuration (Troubleshooting)
- **Used AI for**: Debugging Django 5.x CSRF origin checking (`CSRF_TRUSTED_ORIGINS`) and configuring WhiteNoise static file middleware for production Render deployment.
- **Human Oversight**: Custom DRF `DemoHeaderAuthentication` class created to handle non-cookie API requests cleanly without CSRF rejection.

---

## 3. Key Takeaway & Reflection
Using AI as a pair programmer allowed focusing maximum time on **product quality, user experience, and robust domain modeling**. The AI accelerated mechanical syntax generation, while critical architectural decisions—such as data schema design, permission boundary enforcement, and reviewer-friendly user switching—remained strictly guided by human product judgment.
