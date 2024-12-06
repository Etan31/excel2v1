# Dorothy Database

This project is for saving text, images, and other infos. A table manager similar to excel.

## Prerequisites
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/) and Docker Compose (if using Docker)

---

## Running Locally

### 1. Start the Client Side
1. Open the `index.html` file and start using **Live Server** (e.g., via the Live Server extension in VS Code).

   If you don’t have Live Server installed, you can also serve the `index.html` using any simple HTTP server:
   ```bash
   npx http-server ./client 
    ```

###2. Start the Server Side
1. Navigate to the server directory in your terminal:
```bash
cd server
```
2. Install dependencies
```bash 
npm install
```
3. Start server
```bash
node server.js
```

## Running with Docker

### 1. Start Docker 
```bash
docker-compose up --build
``` 

### 2. Close Docker
```bash
docker-compose down
```

> Developed and maintained by [Tristan Ehron Tumbaga](https://github.com/Etan31)
