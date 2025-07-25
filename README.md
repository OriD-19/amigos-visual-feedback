# API: Análisis de sentimientos, Supermercado Amigos

## Roadmap de features
- [x] Configuración de bases de datos
- [x] Autenticación de usuarios
- [x] Registro de usuarios
- [ ] Modelado de datos y entidades
- [ ] Roles y permisos
- [ ] Subida de archivos (integracion con Google Cloud Storage)
- [ ] Análisis de sentimientos, integracion con Google Vision API
- [ ] Generación de reportes

- [ ] Testing y validación de la API

## 📊 Report Feature Usage

The API provides endpoints to generate feedback reports filtered by product, store, and date range.

### Endpoints

- **GET /reports/raw?store=STORE_ID&type=PRODUCT_TYPE&from=YYYY-MM-DD&to=YYYY-MM-DD**
  - Returns a structured JSON report with summary metrics and detailed feedback entries.

- **GET /reports/pdf?store=STORE_ID&type=PRODUCT_TYPE&from=YYYY-MM-DD&to=YYYY-MM-DD**
  - Returns a downloadable PDF report with the same data, formatted for printing/sharing.

### Query Parameters
- `store` (number, optional): Store (branch) ID to filter by
- `type` (string, optional): Product type/name to filter by (partial match)
- `from` (string, optional): Start date (inclusive, format: YYYY-MM-DD)
- `to` (string, optional): End date (inclusive, format: YYYY-MM-DD)

### Example Requests

**Raw JSON report:**
```
GET /reports/raw?store=1&type=banana&from=2024-06-01&to=2024-06-30
```

**PDF report:**
```
GET /reports/pdf?store=1&type=banana&from=2024-06-01&to=2024-06-30
```

### Report Data Includes
- Report metadata (store, product type, date range, generated timestamp)
- Summary metrics (total feedback, count by emotion, top 3 image issues)
- Detailed entry table: Timestamp, Product, Store, Feedback, Emotion, Issues

---
