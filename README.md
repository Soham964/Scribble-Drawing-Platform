# 🎨 Scribble — Real-Time Drawing & Guessing Game

A full-stack multiplayer drawing and guessing game built with **Spring Boot**, **Next.js**, and **Upstash Redis**. Players take turns drawing a word while others race to guess it in real time.

![Tech Stack](https://img.shields.io/badge/Backend-Spring%20Boot%204-6DB33F?style=flat&logo=springboot)
![Tech Stack](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat&logo=nextdotjs)
![Tech Stack](https://img.shields.io/badge/Database-Upstash%20Redis-DC382D?style=flat&logo=redis)
![Tech Stack](https://img.shields.io/badge/WebSocket-STOMP%20%2F%20SockJS-blue?style=flat)

---

## 📸 Features

- 🎮 **Real-time multiplayer** — WebSocket-powered drawing and guessing
- 🖌️ **Drawing canvas** — Color palette, brush size control, eraser, clear
- 💬 **Live chat** — Guess the word, see others' guesses instantly
- ⏱️ **Round timer** — 60-second countdown with animated ring
- 💡 **Letter hints** — Letters are progressively revealed as time runs out
- 🏆 **Live scoreboard** — Scores update in real time after each correct guess
- 🔒 **Room system** — Create private rooms with a player limit (2–12), join via 6-character code
- ♻️ **Persistent state** — Rooms survive server restarts via Redis (2-hour TTL)
- 🚀 **Production ready** — Deployable to Render (backend) + Vercel (frontend)

---

## 🏗️ Architecture

```
┌─────────────────┐        WebSocket (STOMP/SockJS)       ┌──────────────────────┐
│   Next.js 16    │ ─────────────────────────────────────> │  Spring Boot 4.0.2   │
│   (Vercel)      │ <───────────────────────────────────── │  (Render)            │
│                 │        REST (room create/join)         │                      │
└─────────────────┘                                        └──────────┬───────────┘
                                                                      │ RedisTemplate
                                                                      ▼
                                                           ┌──────────────────────┐
                                                           │   Upstash Redis      │
                                                           │   (Free tier)        │
                                                           └──────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Language |
| Spring Boot | 4.0.2 | Framework |
| Spring WebSocket | — | STOMP WebSocket broker |
| Spring WebMVC | — | REST API |
| Spring Data Redis | — | Redis integration |
| Upstash Redis | — | Persistent room state |
| Lombok | — | Boilerplate reduction |
| Maven | — | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | React framework (App Router) |
| TypeScript | — | Type safety |
| Tailwind CSS | — | Utility styling |
| Framer Motion | — | Animations |
| Zustand | — | Global game state |
| @stomp/stompjs | 7.3 | STOMP WebSocket client |
| sockjs-client | 1.6 | WebSocket fallback transport |
| Lucide React | — | Icons |
| Sonner | — | Toast notifications |

---

## 📁 Project Structure

```
ScribbleApplication/
├── src/main/java/com/scribble/
│   ├── config/
│   │   ├── RedisConfig.java            # Redis template + Jackson 3 serializer
│   │   ├── WebSocketConfig.java        # STOMP endpoint, broker, CORS
│   │   └── WebSocketEventListener.java # Player disconnect handling
│   ├── controller/
│   │   ├── GameWebSocketController.java # /app/join, /app/draw, /app/chat
│   │   └── RoomController.java          # POST /api/rooms/create, GET /api/rooms/{id}
│   ├── dto/
│   │   ├── RoomStateDTO.java            # Broadcast room state to clients
│   │   └── ScoreUpdateDTO.java          # Broadcast score changes
│   ├── engine/
│   │   └── RoundTimer.java              # 60s countdown, hint reveals, drawer rotation
│   ├── model/
│   │   ├── Room.java                    # Room entity (stored in Redis as JSON)
│   │   ├── Player.java                  # Player entity
│   │   ├── ChatMessage.java             # Chat/guess message
│   │   └── DrawData.java                # Drawing event payload
│   ├── service/
│   │   ├── RoomService.java             # Redis CRUD for rooms (with TTL)
│   │   └── WordService.java             # Random word picker
│   └── ScribbleApplication.java
│
├── src/main/resources/
│   └── application.properties           # Config (reads env vars)
│
├── scribble-frontend/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout, Sonner toaster
│   │   ├── page.tsx                     # Join ↔ Game screen switcher
│   │   └── globals.css                  # Dark theme, animations
│   ├── components/
│   │   ├── JoinScreen.tsx               # Home / Create Room / Join Room
│   │   └── game/
│   │       ├── GameRoom.tsx             # Main game layout (no-scroll viewport)
│   │       ├── DrawingCanvas.tsx        # Canvas + toolbar
│   │       ├── ChatPanel.tsx            # Chat bubbles + guess input
│   │       ├── PlayerList.tsx           # Live scoreboard
│   │       ├── TimerRing.tsx            # SVG countdown ring
│   │       └── WordDisplay.tsx          # Masked/revealed word
│   ├── lib/
│   │   ├── socket.ts                    # STOMP client, subscribe, publish helpers
│   │   ├── store.ts                     # Zustand global state
│   │   ├── types.ts                     # TypeScript interfaces
│   │   └── utils.ts                     # cn() utility
│   └── .env.local                       # NEXT_PUBLIC_BACKEND_URL (local dev)
│
├── render.yaml                          # Render deployment config
└── README.md
```

---

## 🚀 Local Development

### Prerequisites
- Java 21+
- Node.js 18+
- Maven (or use the included `./mvnw`)
- Redis (local) **or** an Upstash Redis URL

### 1. Clone the repo

```bash
git clone https://github.com/Soham964/Scribble-Drawing-Platform.git
cd Scribble-Drawing-Platform
```

### 2. Start the backend

**With local Redis:**
```bash
./mvnw spring-boot:run
```

**With Upstash Redis:**
```bash
# Windows (PowerShell)
$env:REDIS_URL='rediss://default:<password>@<host>.upstash.io:6379'
$env:REDIS_SSL='true'
./mvnw spring-boot:run

# macOS / Linux
REDIS_URL='rediss://default:<password>@<host>.upstash.io:6379' REDIS_SSL=true ./mvnw spring-boot:run
```

Backend runs at `http://localhost:8081`

### 3. Start the frontend

```bash
cd scribble-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 🌐 WebSocket API

All WebSocket messages use STOMP over SockJS at `/ws`.

### Client → Server (publish to `/app/...`)

| Destination | Payload | Description |
|---|---|---|
| `/app/join` | `ChatMessage` | Join or create a room |
| `/app/draw` | `DrawData` | Send a drawing event |
| `/app/chat` | `ChatMessage` | Send a chat message or guess |

### Server → Client (subscribe to `/topic/...`)

| Topic | Payload | Description |
|---|---|---|
| `/topic/room/{roomId}` | `RoomStateDTO` | Full room state update |
| `/topic/draw/{roomId}` | `DrawData` | Drawing event from the drawer |
| `/topic/chat/{roomId}` | `ChatMessage` | Chat message or guess result |
| `/topic/timer/{roomId}` | `int` | Seconds remaining in round |
| `/topic/score/{roomId}` | `ScoreUpdateDTO` | Score update after correct guess |

### STOMP Connect Headers

```
playerName: <your name>
roomId:     <room id>
```

---

## 🔌 REST API

### Create a Room
```http
POST /api/rooms/create
Content-Type: application/json

{ "maxPlayers": 6 }
```
**Response:**
```json
{ "roomId": "a3f9c2", "maxPlayers": 6 }
```

### Get Room Info
```http
GET /api/rooms/{roomId}
```
**Response:**
```json
{
  "roomId": "a3f9c2",
  "maxPlayers": 6,
  "currentPlayers": 3,
  "isFull": false
}
```

---

## ☁️ Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set the following:
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/ScribbleApplication-0.0.1-SNAPSHOT.jar`
   - **Root Directory:** *(leave blank)*
4. Add environment variables:

| Key | Value |
|---|---|
| `REDIS_URL` | `rediss://default:<password>@<host>.upstash.io:6379` |
| `REDIS_SSL` | `true` |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| `PORT` | `8081` |

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import the same GitHub repo
3. Set **Root Directory** to `scribble-frontend`
4. Add environment variable:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-render-app.onrender.com` |

5. Deploy — then go back to Render and update `ALLOWED_ORIGINS` with your Vercel URL.

### Redis → Upstash (Free)

1. Sign up at [upstash.com](https://upstash.com)
2. Create a database (any region)
3. Copy the **Redis URL** from the dashboard
4. Paste it as `REDIS_URL` in Render

---

## ⚙️ Environment Variables

### Backend (`application.properties` / Render)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8081` | Server port |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `REDIS_SSL` | `false` | Enable TLS (required for Upstash) |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allowed origins |
| `app.room-ttl-seconds` | `7200` | Room expiry in Redis (2 hours) |

### Frontend (`scribble-frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8081` | Spring Boot backend URL |

---

## 🎮 How to Play

1. Open the app and enter your name
2. **Create Room** — pick a player limit (2–12), get a 6-character room code
3. Share the code with friends
4. Friends click **Join Room** and enter the code
5. The first player starts drawing — others type guesses in the chat
6. Correct guess → guesser gets **+10 pts**, drawer gets **+5 pts**
7. After 60 seconds (or a correct guess), the next player draws
8. Letters are revealed as hints as time runs out

---

## 📄 License

MIT
