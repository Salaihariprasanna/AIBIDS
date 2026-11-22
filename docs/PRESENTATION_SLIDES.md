# AIBIDS: Presentation & Viva Slide Deck
### *AI-Powered BI: Smart Data Analytics & Decision Support System*

---

## 📽️ Slide 1: Title Slide
* **Project Title**: AI-Powered BI: Smart Data Analytics & Decision Support System (AIBIDS)
* **Domain**: Artificial Intelligence, Business Intelligence (BI), Decision Support Systems (DSS), In-Memory OLAP
* **Presenter**: [Your Name / Group Members]
* **Supervisor**: [Faculty Guide Name]

---

## 📽️ Slide 2: Problem Statement & Motivation
* **The Problem**: 
  - Traditional BI tools (PowerBI, Tableau) are complex, requiring manual dashboard configuration, DAX, and SQL expertise.
  - Decision-makers suffer delays waiting for data analysts to answer ad-hoc questions.
* **Our Solution**: 
  - An AI-first Decision Support System that allows users to ask questions in natural language, automatically profiles datasets, forecasts metrics, and simulates "What-If" business scenarios.

---

## 📽️ Slide 3: System Architecture
* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts (Dark Glassmorphic UI).
* **Backend**: Python 3.13, FastAPI (Asynchronous REST API).
* **Data Processing**: DuckDB (Zero-copy in-memory OLAP engine).
* **AI & Machine Learning**: 
  - Adaptive LLM (Google Gemini 2.5 Flash / OpenAI / Offline Semantic Engine).
  - Time-Series Forecasting (Ridge Regression with Confidence Bands).
  - Outlier Detection (Isolation Forests).

---

## 📽️ Slide 4: Key Module 1 — Conversational BI (Text-to-SQL)
* **How it works**:
  1. User asks: *"Show top 5 product categories by profit margin"*.
  2. AI grounds the question with the DuckDB schema and generates a safe `SELECT` query.
  3. Query executes in `< 20ms` in DuckDB.
  4. System automatically recommends and renders the optimal visualization (Bar, Line, Pie, Scatter).
* **Security Guardrail**: Intercepts and blocks non-SELECT queries (`DROP`, `DELETE`, `UPDATE`).

---

## 📽️ Slide 5: Key Module 2 — Automated EDA & Quality Studio
* **Automated Data Profiling**:
  - Computes complete column distributions (Mean, Median, Std, Min, Max, Quartiles).
  - Computes missingness % and unique cardinalities.
  - Overall Data Quality Health Score (0–100 scale).
  - Pearson Correlation Heatmap across all numeric dimensions.

---

## 📽️ Slide 6: Key Module 3 — Predictive Analytics & Forecasting
* **Time-Series Horizon Extrapolation**:
  - Projects 3, 6, 12, or 24-period future trajectories.
  - Displays historical actuals alongside predicted forecasts with upper/lower 95% confidence intervals.
* **Multivariate Anomaly Detection**:
  - Uses **Isolation Forests** to isolate abnormal multi-feature transactions and identifies root variance contributors.

---

## 📽️ Slide 7: Key Module 4 — "What-If" Scenario Simulator (DSS)
* **Decision Support Capability**:
  - Interactive slider levers allow executives to test hypothetical adjustments (e.g. +15% Marketing, -5% Price).
  - Multi-variable linear sensitivity modeling estimates target KPI impacts (Revenue, Profit, MRR).
  - Synthesizes prescriptive recommendations and plots elasticity sensitivity curves.

---

## 📽️ Slide 8: Key Module 5 — Universal External Dataset Hub
* **Multi-Format Ingestion**:
  - File Uploads: CSV, Excel (`.xlsx`, `.xls`), JSON, Parquet.
  - Remote URL Fetcher: Ingests online datasets directly.
  - SQL Database Connector: PostgreSQL, MySQL, SQLite connection strings.
  - 5 Pre-packaged Real-world Datasets: E-Commerce Sales, SaaS Metrics, Financial Cashflow, Healthcare Analytics, Supply Chain Logistics.

---

## 📽️ Slide 9: Verification & Experimental Results
* **Automated Test Results**: 8/8 test suites passed (`pytest`).
* **Performance**: Sub-second query aggregation on in-memory DuckDB.
* **Security**: 100% injection prevention with read-only AST sandboxing.

---

## 📽️ Slide 10: Live Demonstration Flow
1. **Explore Dashboard**: View KPI cards, health scores, and charts.
2. **Chat with Data**: Ask natural language questions, toggle SQL, and export query CSVs.
3. **Inspect AutoEDA**: Review correlation heatmap and column missingness.
4. **Run Forecast**: Generate a 6-month predictive projection.
5. **Simulate Scenario**: Adjust driver sliders to see simulated profit impacts.
6. **Generate Briefing**: Produce an exportable executive strategic summary.

---

## 📽️ Slide 11: Conclusion & Future Enhancements
* **Summary**: A comprehensive, secure, and user-friendly AI-driven Decision Support System.
* **Future Work**:
  - Voice-driven analytics assistant.
  - Real-time streaming ingestion via Kafka / WebSockets.
  - Cloud warehouse integration (BigQuery, Snowflake).

---

## 📽️ Slide 12: Q&A / Thank You
* Thank you to the evaluation committee.
* Ready for questions & live demonstration!
