# AIBIDS: AI-Powered BI & Decision Support System
### *Smart Data Analytics, Conversational BI (Text-to-SQL), AutoEDA & Scenario Simulator*

---

## 🌟 Overview

**AIBIDS** is an intelligent Business Intelligence (BI) and Decision Support System (DSS) designed to empower non-technical executives and data analysts to extract actionable insights, forecast KPIs, and simulate business decisions using natural language.

---

## 🚀 Key Modules & Capabilities

1. **Executive Dashboard**: Real-time telemetry, KPI cards, visual charts, and automated anomaly health meters.
2. **Conversational BI (Text-to-SQL)**: Ask queries in plain English. The system converts questions to DuckDB SQL queries, enforces read-only security AST guardrails, and renders auto-recommended charts (Bar, Line, Area, Pie, Scatter, Table).
3. **Automated EDA & Quality Studio**: Full data profiling, missingness diagnostics, data health scores (0–100), and interactive Pearson correlation heatmaps.
4. **Predictive Analytics & Forecasting**: Extrapolates time-series trends with 95% confidence intervals and detects multivariate anomalies using Isolation Forests.
5. **"What-If" Scenario Simulator (DSS)**: Adjust business drivers (e.g. Price Elasticity, Marketing Budget, Shipping Costs) with interactive sliders to project target KPI impacts and receive prescriptive AI advice.
6. **Executive Intelligence Briefing**: One-click strategic report generation with identified risk factors, takeaways, and PDF/printable export.
7. **Universal External Dataset Importer**:
   - Multi-format file upload (CSV, Excel `.xlsx`/`.xls`, JSON, Parquet)
   - Remote URL raw data fetcher
   - SQL database connector (PostgreSQL, MySQL, SQLite)
   - Pre-loaded sample datasets (E-Commerce Sales, SaaS Subscription Metrics, Financial Cashflow)

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios |
| **Backend API** | Python 3.13, FastAPI, Pydantic v2, Uvicorn |
| **In-Memory OLAP** | DuckDB (High-performance columnar engine) |
| **Data Engine & ML**| Pandas, NumPy, Scikit-learn, OpenPyXL, SQLAlchemy |
| **AI / LLM Engine** | Adaptive Engine: Google Gemini 2.5 Flash, OpenAI GPT-4o-mini, or Built-in Offline Semantic Rule Engine |

---

## ⚙️ Quick Start Guide

### 🚀 Option A: Single-Click Launch (Recommended)
* **Start Application**: Double-click [`START_AIBIDS.bat`](file:///d:/COLLEGE/PROJECT/AIBIDS/START_AIBIDS.bat) (starts both Backend and Frontend and opens `http://localhost:5173` in your browser).
* **Stop Application**: Double-click [`STOP_AIBIDS.bat`](file:///d:/COLLEGE/PROJECT/AIBIDS/STOP_AIBIDS.bat) to terminate all server processes.
* **Desktop Shortcut**: Double-click [`CREATE_DESKTOP_SHORTCUT.bat`](file:///d:/COLLEGE/PROJECT/AIBIDS/CREATE_DESKTOP_SHORTCUT.bat) to place a 1-click icon on your Desktop.

---

### 💻 Option B: Manual Terminal Setup

#### 1. Backend Setup

```bash
# Navigate to project root
cd d:/COLLEGE/PROJECT/AIBIDS

# Activate Virtual Environment
backend\venv\Scripts\activate

# Start the FastAPI Backend Server
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```
* Backend API runs at: **`http://localhost:8000`**
* Interactive Swagger Docs: **`http://localhost:8000/docs`**

---

### 2. Frontend Setup

```bash
# Navigate to frontend folder
cd d:/COLLEGE/PROJECT/AIBIDS/frontend

# Start Vite Development Server
npm run dev
```
* Frontend UI runs at: **`http://localhost:5173`**

---

### 3. Running Automated Tests

```bash
cd d:/COLLEGE/PROJECT/AIBIDS
backend\venv\Scripts\pytest backend/tests -v
```

---

## 🔒 Security & Guardrails

* **SQL Sandbox**: Only read-only `SELECT` statements are executed. All destructive statements (`DROP`, `DELETE`, `TRUNCATE`, `ALTER`, `INSERT`, `UPDATE`, `EXEC`, etc.) are intercepted and blocked before execution.
* **Zero Data Leakage**: Option to use local offline heuristic engine without sending data to external APIs.
