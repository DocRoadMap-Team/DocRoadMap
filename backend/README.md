# 🚀 DocRoadMap – Backend Launch Guide

## 📦 Contents

* [Prerequisites](#-prerequisites)
* [Environment Configuration](#-environment-configuration)
* [Launching the Backend](#-launching-the-backend)
* [PostgreSQL Access and Extensions](#-postgresql-access-and-extensions)
* [Accessing the Services](#-accessing-the-services)
* [Useful Commands](#-useful-commands)
* [Project Structure](#-project-structure)

---

## 🔧 Prerequisites

* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)
* An OpenAI API key
* A valid email service password

---

## 🧾 Environment Configuration

Create a `.env` file at the root of the `backend` folder (same level as `docker-compose.yml`) with the following content:

```env
MAIL_PASSWORD=your_email_password_here
POSTGRES_PASSWORD=your_postgres_password_here
OPENAI_API_KEY=your_openai_api_key_here
```

> 🔐 **Do not commit this file to Git!**

---

## ▶️ Launching the Backend

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone https://github.com/DocRoadMap-Team/DocRoadMap.git
   ```

2. **Create the `.env` file** as described above.

3. **Start the application** with Docker Compose:

   ```bash
   docker compose up
   ```

   This will:

   * Build the NestJS backend image
   * Start a PostgreSQL container with the specified password
   * Launch the backend server


## 🗃️ PostgreSQL Access and Extensions

To connect to the PostgreSQL container and execute SQL commands (e.g., enabling extensions):

Open a terminal in the PostgreSQL container:

docker exec -it DocRoadMapDatabase psql -U postgres -d DocRoadMapDatabase

Once connected to PostgreSQL, run:

```CREATE EXTENSION IF NOT EXISTS "uuid-ossp";```

## 🌐 Accessing the Services

* **NestJS Backend API**: [http://localhost:8082](http://localhost:8082)
* **Swagger Documentation**: [http://localhost:8082/api/docs](http://localhost:8082/api/docs)

---

## 🧹 Useful Command

* **Stop all services**:

  ```bash
  docker compose down
  ```