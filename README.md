# 🌐 BlueProxy WebRTC 🎧🎥

Welcome to **BlueProxy WebRTC** — a super sleek remote browser experience **with audio and video** using **WebRTC**, no VNC! 🚀

Experience:  
- 🔥 Dark gradient + moving particles UI  
- 🖼️ Custom image/card layout  
- 🎶 Full audio support  
- 🎬 Headless Chrome / Puppeteer backend  
- 🌍 Stream directly to your browser  

---

## 📦 Prerequisites

Before running the project, make sure you have:

- **Node.js** v18+  
- **npm** (comes with Node.js)  
- **Chrome/Chromium** (optional; Puppeteer downloads its own)  
- **FFmpeg** (optional, for audio handling)  

### **Ubuntu / Debian**
```bash
sudo apt update
sudo apt install -y libnss3 libxss1 ffmpeg alsa-utils pulseaudio libasound2-plugins
```

### **Windows**
- Install Chrome/Chromium  
- Optional: install FFmpeg and add it to PATH  

---

## ⚙️ Installation

Clone this repo and install dependencies:

```bash
git clone https://github.com/sc70049109-wq/blueproxy
cd blueproxy

# Install node-pre-gyp globally
npm install -g node-pre-gyp

# Or install as a dev dependency in your project
npm install node-pre-gyp --save-dev

# Install backend dependencies
npm install express ws puppeteer wrtc

# Install frontend dependencies
npm install react react-dom vite
npm install react-tsparticles tsparticles
```

---

## 🖥️ Running the Project

### **1. Start the Backend**
```bash
cd backend
node server.js
```

This will:  
- Launch **headless Chrome**  
- Open a new page for each WebRTC session  
- Start a **WebSocket signaling server**  

---

### **2. Start the Frontend**
```bash
cd frontend
npx vite
```

Open your browser at the address Vite provides (usually `http://localhost:5173`)  

Your UI will show:  
- Dark gradient background with moving particles ✨  
- Your images/cards layout  
- The **remote browser stream** via WebRTC  

---

## 🔧 File Structure

```
blueproxy-webrtc/
├─ frontend/
│  ├─ app.jsx          # Main React frontend (particles + images + video)
│  └─ index.html
├─ server.js           # Backend WebSocket + Puppeteer server
├─ package.json
└─ README.md
```

---

## 💻 Usage Notes

- WebRTC handles both **audio and video** automatically  
- Change your UI in `app.jsx` (layout, particles, images)  
- Change signaling or Puppeteer options in `server.js` if needed  
- All other files are **mostly plug-and-play**  

---

## 🎨 Cool Features

- Dark gradient + particles background 🌌  
- Minimal, modern card layout 🖼️  
- Fully reactive React frontend ⚡  
- Audio streaming from the headless browser 🎧  
- Easy to customize, drop-in ready 🔥  

---

## 🛠️ Troubleshooting

- ❌ Puppeteer errors: make sure your system has **libnss3, libxss1, libasound2** installed  
- ❌ Audio not working: check Chrome permissions & your system audio settings  
- ❌ Port conflicts: change backend port in `server.js`  

---

## ✨ Contributing

Pull requests are welcome!  
- Improve particles effects  
- Add new UI themes  
- Enhance audio/video performance  

---

## 📜 License

MIT License

