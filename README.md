# BlueProxy

A simple blue-themed web proxy with a frontend (React + Vite) and backend (Node.js + Express).  
This guide explains how to install and run it on a Linux machine.

---

## 📦 Clone the Repository

```bash
git clone https://github.com/sc70049109-wq/BlueProxy.git
cd BlueProxy
```

---

## 🖥️ Backend Setup (Node.js + Express)

### 1. Install Node.js

If you don't have Node.js installed:

```bash
sudo apt update
sudo apt install nodejs npm -y
```

Or install a newer version:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Start the proxy server

```bash
node server.js
```

Backend runs on **http://localhost:8080** by default.

---

## 🎨 Frontend Setup (React + Vite)

Open a new terminal window and run:

```bash
cd frontend
npm install
```

### 1. Start the frontend dev server

```bash
npm run dev
```

Vite will show something like:

```
http://localhost:5173/
```

Open that URL in your browser.

---

## 🔗 Connecting Frontend and Backend

The frontend is already configured to proxy `/r/*` requests to the backend.

If running in production, update your API endpoint in:

```
frontend/src/App.jsx
```

Change:

```js
const PROXY_BASE = "http://localhost:8080/r/";
```

---

## 🏗️ Build Frontend (Optional)

To generate a production build:

```bash
cd frontend
npm run build
```

Files will be in:

```
frontend/dist/
```

You can serve them using:

```bash
npm install -g serve
serve -s dist
```

---

## 📚 Project Structure

```
BlueProxy/
 ├── backend/
 │    ├── server.js
 │    └── package.json
 ├── frontend/
 │    ├── src/
 │    ├── index.html
 │    └── package.json
 └── README.md
```

---

## 🛠️ Notes / Limitations

- Audio is disabled by injecting a mute script unless "Enable Audio" is checked.
- Some websites may break due to CSP headers or heavy JS.
- This is a lightweight proxy and not a security tool.

---

## 💬 Support

Feel free to open issues or pull requests on GitHub:

👉 https://github.com/sc70049109-wq/BlueProxy

---

Enjoy using **BlueProxy**! 🚀
