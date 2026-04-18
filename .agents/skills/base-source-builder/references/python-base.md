# Python Base Source

Default target: FastAPI application with modular enterprise-style structure.

## 1. Default Stack

- Python: 3.12 by default
- Framework: FastAPI
- Package/build metadata: `pyproject.toml`
- Test framework: pytest
- Formatting and linting: Ruff
- Data validation: Pydantic Settings + Pydantic models
- Database path: SQLAlchemy or SQLModel friendly structure
- Migration tool: Alembic

If the user does not specify framework details, generate a FastAPI base source first.
Ask for the Python version before scaffolding. Recommend Python 3.11 or Python 3.12, but allow another version if the user explicitly requests it.

## 1.1 Version Guidance

- Recommended versions:
  - Python 3.11
  - Python 3.12
- Default version: Python 3.12

Reasoning:

- Python 3.11 is broadly supported and performant.
- Python 3.12 is a strong default for new projects when dependency support is current.

If the user requests another version:

- accept it when FastAPI and core dependencies can support it
- set `requires-python` and tool targets to the exact requested version
- warn if dependency compatibility should be checked manually

## 2. Standard Directory Structure

```text
project-name/
├── app/
│   ├── api/
│   │   ├── deps.py
│   │   └── v1/
│   │       └── endpoints/
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── crud/
│   └── main.py
├── tests/
│   ├── unit/
│   └── integration/
├── alembic/
│   ├── versions/
│   └── env.py
├── .editorconfig
├── .gitignore
├── alembic.ini
└── pyproject.toml
```

## 3. Naming Rules

- Python package directory: `snake_case`
- Module files: `snake_case.py`
- Test files: `test_<module>.py`
- Class names: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- API route modules: `snake_case.py`
- Pydantic schema modules: `snake_case.py`
- Service modules: `snake_case.py`
- CRUD modules: `snake_case.py`

The import root should remain under `app/` for the default scaffold.

## 4. Required Files

- `pyproject.toml`
- `.editorconfig`
- `.gitignore`
- `app/main.py`
- `app/api/`
- `app/core/`
- `app/models/`
- `app/schemas/`
- `app/services/`
- `app/crud/`
- `tests/unit/`
- `tests/integration/`
- `alembic/`
- `alembic.ini`

## 5. Default Format Rules

Configure these in `pyproject.toml`:

- `fastapi`
- `uvicorn`
- `pydantic-settings`
- `sqlalchemy` or `sqlmodel`
- `alembic`
- `ruff` for linting
- `ruff format` for formatting
- `pytest` for tests
- target Python version set explicitly to the selected version

Expected developer commands:

- `uvicorn app.main:app --reload`
- `ruff format .`
- `ruff check .`
- `pytest`
- `alembic upgrade head`

## 6. FastAPI Base Source Expectations

- Use the `app/` layout by default.
- `main.py` must expose a FastAPI `app`.
- Route registration should be isolated from application bootstrapping.
- Routers should be versioned under `api/v1/` by default.
- Put environment and settings logic under `core/`.
- Keep database models in `models/`, request/response contracts in `schemas/`, business logic in `services/`, and persistence operations in `crud/`.
- Keep business logic out of route handlers.
- The generated `pyproject.toml` must reflect the selected Python version exactly.
