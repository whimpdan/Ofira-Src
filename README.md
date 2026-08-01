<div align="center">

# 🎵 Ofira Src — Advanced Discord Music Bot & Hybrid Handler

*A high-performance, feature-packed Discord Music Bot framework built with TypeScript, Discord.js v14, Lavalink, and Hybrid Sharding.*

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2.svg?style=for-the-badge&logo=discord)](https://discord.js.org/)
[![Lavalink](https://img.shields.io/badge/Lavalink-Client_v2.5-red.svg?style=for-the-badge&logo=youtube)](https://github.com/lavalink-devs/Lavalink)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 Key Features

- 🎧 **Lavalink Audio Engine**: Seamless, high-quality audio playback using `lavalink-client` v2 with multi-node failover and reconnection handling.
- ⚡ **SWC Fast Compiler**: Supercharged compilation speed with `@swc/core` and `@swc/cli` for rapid development and production builds.
- 🚀 **Hybrid Sharding System**: Powered by `discord-hybrid-sharding` with ClusterManager and HeartbeatManager to seamlessly scale across thousands of guilds.
- 🎛️ **Audio Filters Suite**: Real-time DSP audio filters including **Karaoke**, **Nightcore**, **Vaporwave**, **Tremolo**, **Vibrato**, **Lowpass**, and **3D Rotation**.
- 🔀 **Rich Music Controls**: Play, Search, Queue management, Autoplay, Volume control, Loop modes, Track removal, Seek, and 24/7 Voice Channel Mode.
- 🛡️ **MongoDB Integration**: Guild configuration, prefix management, ignore-channels list, user profiles, premium subscription system, and no-prefix access control.
- 📊 **Webhook Analytics & Logging**: Dedicated webhooks for Command Logs, Error Tracebacks, Server Join/Leave events, and Cluster lifecycle events.

---

## 📂 Project Architecture

```plain
Ofira Src/
├── src/
│   ├── index.ts              # Cluster Manager & Hybrid Sharding Entry Point
│   ├── bot.ts                # Client Instantiation & Bot Initialization
│   ├── config/
│   │   ├── config.ts         # Main Bot Settings (Colors, Webhooks, Links)
│   │   ├── emoji.ts          # Emoji Definitions
│   │   ├── lavalink.ts       # Lavalink Nodes Configuration
│   │   └── token.ts          # Discord Bot Secret Token
│   ├── structures/           # Core Bot Engine Classes
│   │   ├── client.ts         # Extended Discord Client & Lavalink Manager
│   │   ├── command.ts        # Modular Command Builder Structure
│   │   ├── context.ts        # Interaction & Message Context Abstraction
│   │   ├── event.ts          # Event Listener Base Structure
│   │   ├── functions.ts      # Utility Helpers & Embed Formatters
│   │   └── logger.ts         # Styled Console Logger
│   ├── db/                   # Mongoose Schemas & Database Models
│   ├── events/               # Discord & Lavalink Event Handlers
│   └── commands/             # Command Handlers Organized by Category
│       ├── music/            # Play, Queue, Skip, Search, Autoplay, etc.
│       ├── filters/          # Karaoke, Nightcore, Vaporwave, Vibrato, etc.
│       ├── configuration/    # Custom Prefix, 24/7 Mode, Ignore Channels
│       ├── dev/              # Deploy, Node Status, Premium, No-Prefix Manager
│       └── utility/          # Help, Ping, Profile, Stats, Uptime, Support
├── swc.config.json           # SWC Compiler Configuration
├── tsconfig.json             # TypeScript Configuration
└── package.json              # Project Dependencies & Scripts
```

---

## 🚀 Commands Overview

### 🎶 Music Commands (`src/commands/music/`)
| Command | Description |
| :--- | :--- |
| `play` | Search and play tracks/playlists from YouTube, Spotify, etc. |
| `search` | Interactively search and select tracks to queue. |
| `queue` | Display the current guild song queue and playback state. |
| `nowplaying` | Show details and progress of the currently playing track. |
| `pause` / `resume` | Pause or resume current audio playback. |
| `skip` | Skip the current track to play the next song in queue. |
| `stop` | Stop playback, clear the queue, and leave the voice channel. |
| `seek` | Jump to a specific time timestamp in the playing track. |
| `volume` | Adjust the player volume (0% - 150%). |
| `loop` | Toggle repeat modes: Off, Track, or Queue. |
| `shuffle` | Randomize the order of tracks in the queue. |
| `autoplay` | Enable or disable automatic queue recommendations. |
| `clearqueue` | Remove all queued tracks without stopping playback. |
| `remove` | Remove a specific song from the queue by position. |
| `join` / `leave` | Summon or disconnect the bot from your voice channel. |

### 🎛️ Audio Filters (`src/commands/filters/`)
| Command | Description |
| :--- | :--- |
| `clear` | Reset all active audio DSP filters back to default. |
| `nightcore` | Speed up audio tempo and raise pitch. |
| `vaporwave` | Slow down audio tempo and lower pitch. |
| `karaoke` | Filter vocals out for a karaoke singing experience. |
| `lowpass` | Suppress high frequencies for a muffled low-bass sound. |
| `tremolo` | Apply volume oscillation / trembling effect. |
| `vibrato` | Apply pitch modulation / vibrato effect. |
| `rotation` | Apply 3D spatial rotating audio panning effect. |

### ⚙️ Configuration (`src/commands/configuration/`)
| Command | Description |
| :--- | :--- |
| `prefix` | Set or reset the custom command prefix for your guild. |
| `247` | Toggle 24/7 mode to keep the bot connected to voice channels. |
| `ignoreChannelAdd` | Add a channel to the bot's ignored command list. |
| `ignoreChannelRemove` | Remove a channel from the ignored command list. |
| `ignoreChannelList` | View all ignored channels in the current guild. |

### 🛠️ Utility & Developer (`src/commands/utility/` & `dev/`)
| Command | Description |
| :--- | :--- |
| `help` | Interactive command list and detailed usage guide. |
| `ping` | Check Bot latency, WebSocket ping, and Database latency. |
| `stats` | View cluster stats, RAM usage, Uptime, and Node status. |
| `profile` | Display user profile, premium status, and permissions. |
| `noprefix` | *(Dev)* Manage global no-prefix user access. |
| `premium` | *(Dev)* Manage guild and user premium subscriptions. |
| `node` | *(Dev)* Inspect connected Lavalink node status and stats. |

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MongoDB**: Active MongoDB connection URI
- **Lavalink**: At least one active Lavalink v4 server node

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/whimpdan/Ofira-Src.git
cd Ofira-Src
npm install
```

### 3. Configuration

1. Set your Discord Bot Token in `src/config/token.ts`:
   ```typescript
   export default {
     token: "YOUR_DISCORD_BOT_TOKEN_HERE"
   };
   ```

2. Configure main settings in `src/config/config.ts`:
   - Specify your MongoDB URI (`mongo: "mongodb+srv://..."`)
   - Add Bot Owner ID(s) (`owners: ["YOUR_DISCORD_USER_ID"]`)
   - Configure Webhook URLs for logging (command logs, errors, join/leave logs)

3. Update Lavalink Node details in `src/config/lavalink.ts`:
   ```typescript
   export default {
     nodes: [
       {
         id: "node-01",
         host: "YOUR_LAVALINK_HOST",
         port: 80,
         authorization: "YOUR_LAVALINK_PASSWORD",
         secure: false,
       },
     ],
   };
   ```

### 4. Build & Run

- **Build the TypeScript code using SWC**:
  ```bash
  npm run build
  ```

- **Start the Sharded Bot Production Engine**:
  ```bash
  npm run start
  ```

- **Development Mode (Watch mode)**:
  ```bash
  npm run dev
  ```

---

## 📄 License

This project is open-source and released under the [ISC License](LICENSE).

---

## 📜 Credits

> [!NOTE]  
> This codebase was designed and developed by **Boyfie**, he is the original developer and creator of the project. Any existing functionality and core architecture are based on his work.

## 🧾 Copy Cat

> The current version of the so called NOTING BOT is still running on this source code.