<div align="center">

# Ofira Source
### Advanced Discord Music Bot Framework

A scalable Discord music bot framework built with **TypeScript**, **Discord.js v14**, **Lavalink**, and **Hybrid Sharding**, designed for high-performance music playback and large-scale deployments.

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2.svg?style=for-the-badge&logo=discord)](https://discord.js.org/)
[![Lavalink](https://img.shields.io/badge/Lavalink-Client_v2.5-red.svg?style=for-the-badge)](https://github.com/lavalink-devs/Lavalink)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

# Overview

Ofira Source is a production-ready Discord music bot framework focused on scalability, maintainability, and performance. Built on Discord.js v14 and Lavalink, it provides a modular architecture with hybrid sharding, efficient audio playback, and an organized command system suitable for both personal and large public deployments.

---

# Features

- High-performance audio playback powered by **lavalink-client v2**
- Hybrid sharding using **discord-hybrid-sharding**
- SWC-based compilation for significantly faster builds
- Multi-node Lavalink support with automatic reconnection and failover
- Real-time audio filters including Karaoke, Nightcore, Vaporwave, Tremolo, Vibrato, Lowpass, and Rotation
- Queue management, autoplay, looping, seeking, volume control, and 24/7 mode
- MongoDB integration for persistent guild and user configuration
- Premium and no-prefix management system
- Comprehensive webhook logging for commands, errors, guild events, and cluster lifecycle
- Modular command, event, and database architecture
- Production-ready TypeScript codebase

---

# Project Structure

```text
Ofira-Source/
├── src/
│   ├── index.ts
│   ├── bot.ts
│   ├── config/
│   ├── commands/
│   │   ├── music/
│   │   ├── filters/
│   │   ├── configuration/
│   │   ├── utility/
│   │   └── dev/
│   ├── db/
│   ├── events/
│   └── structures/
├── swc.config.json
├── tsconfig.json
└── package.json
```

---

# Command Categories

## Music

| Command | Description |
|---------|-------------|
| `play` | Search and play tracks or playlists |
| `search` | Interactive track search |
| `queue` | Display the current queue |
| `nowplaying` | Show information about the current track |
| `pause` / `resume` | Pause or resume playback |
| `skip` | Skip the current track |
| `stop` | Stop playback and clear the queue |
| `seek` | Seek to a specific timestamp |
| `volume` | Adjust playback volume |
| `loop` | Toggle loop modes |
| `shuffle` | Shuffle the queue |
| `autoplay` | Toggle autoplay |
| `clearqueue` | Remove every queued track |
| `remove` | Remove a track by position |
| `join` / `leave` | Connect or disconnect from a voice channel |

---

## Audio Filters

| Command | Description |
|---------|-------------|
| `clear` | Reset all active filters |
| `nightcore` | Increase speed and pitch |
| `vaporwave` | Lower speed and pitch |
| `karaoke` | Reduce vocals |
| `lowpass` | Apply a low-pass filter |
| `tremolo` | Apply tremolo effect |
| `vibrato` | Apply vibrato effect |
| `rotation` | Apply stereo rotation |

---

## Configuration

| Command | Description |
|---------|-------------|
| `prefix` | Configure a custom guild prefix |
| `247` | Toggle persistent voice connection |
| `ignoreChannelAdd` | Ignore a channel |
| `ignoreChannelRemove` | Remove an ignored channel |
| `ignoreChannelList` | View ignored channels |

---

## Utility & Developer

| Command | Description |
|---------|-------------|
| `help` | Display available commands |
| `ping` | Display bot latency |
| `stats` | View cluster and system statistics |
| `profile` | View user profile information |
| `noprefix` | Manage no-prefix users |
| `premium` | Manage premium subscriptions |
| `node` | View Lavalink node statistics |

---

# Requirements

- Node.js **18+**
- MongoDB
- Lavalink v4

---

# Installation

Clone the repository.

```bash
git clone https://github.com/whimpdan/Ofira-Src.git
cd Ofira-Src
```

Install dependencies.

```bash
npm install
```

---

# Configuration

Configure the following before starting the bot.

### Discord Token

`src/config/token.ts`

```ts
export default {
  token: "YOUR_BOT_TOKEN"
};
```

### Main Configuration

`src/config/config.ts`

Configure:

- MongoDB connection URI
- Owner IDs
- Webhook URLs
- Bot links
- Embed colors
- Additional project settings

### Lavalink Nodes

`src/config/lavalink.ts`

```ts
export default {
  nodes: [
    {
      id: "node-01",
      host: "YOUR_HOST",
      port: 80,
      authorization: "YOUR_PASSWORD",
      secure: false,
    },
  ],
};
```

---

# Running the Project

Build the project.

```bash
npm run build
```

Start the production build.

```bash
npm run start
```

Start in development mode.

```bash
npm run dev
```

---

# Technology Stack

- TypeScript
- Discord.js v14
- Lavalink Client v2
- MongoDB
- Mongoose
- discord-hybrid-sharding
- SWC
- Node.js

---

# License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

---

# Credits

> This project was originally designed and developed by **Boyfie**. The core architecture and initial implementation are based on his work.

---
# Copy Cat

> The current version of the so called NOTING BOT is still running on this source code.

# Notice

This repository is provided for educational and development purposes. Please respect the original author's work and applicable open-source licensing terms when using or modifying this project.
