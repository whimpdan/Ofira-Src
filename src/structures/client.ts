import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  ApplicationCommandType,
  Client,
  Collection,
  EmbedBuilder,
  PermissionsBitField,
  REST,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { LavalinkManager, type SearchPlatform } from "lavalink-client";
import mongoose from "mongoose";
import config from "../config/config.js";
import emoji from "../config/emoji.js";
import Logger from "./logger.js";
import { type Command } from "./index.js";
import token from "../config/token.js";
import lavalink from "../config/lavalink.js";
import { autoPlayFunction } from "./functions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("uncaughtExceptionMonitor", (error) => {
  console.error("Uncaught Exception Monitor:", error);
});

export default class Bot extends Client {
  constructor() {
    super({
      intents: [33409],
      shards: getInfo().SHARD_LIST,
      shardCount: getInfo().TOTAL_SHARDS,
      allowedMentions: { parse: ["users", "roles"], repliedUser: false },
    });
  }

  public commands: Collection<string, any> = new Collection();
  public aliases: Collection<string, any> = new Collection();
  public cooldown: Collection<string, any> = new Collection();
  public readonly config = config;
  public readonly emoji = emoji;
  public readonly color = config.color;
  private body: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  public cluster = new ClusterClient(this);
  public logger = new Logger();

  public manager = new LavalinkManager({
    nodes: lavalink.nodes,
    sendToShard: (guildId, payload) =>
      this.guilds.cache.get(guildId)?.shard?.send(payload),
    autoSkip: true,
    client: {
      id: this.user?.id,
      username: `${this.user?.username}`,
    },
    queueOptions: {
      maxPreviousTracks: 25,
    },
    playerOptions: {
      defaultSearchPlatform: config.searchEngine as SearchPlatform,
      onDisconnect: {
        autoReconnect: true,
        destroyPlayer: false,
      },
      onEmptyQueue: {
        autoPlayFunction,
      },
    },
  });

  public embed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  public async start(token: string): Promise<void> {
    await this.loadCommands();
    this.logger.info("Successfully loaded commands!");
    await this.loadEvents();
    this.logger.info("Successfully loaded events!");
    await this.connectMongo();
    await this.login(token);
  }

  private connectMongo() {
    mongoose.set("strictQuery", true);
    mongoose.connect(this.config.mongo);
    this.logger.info("Successfully connected to mongoDB!");
  }

  private async loadCommands(): Promise<void> {
    const commandsPath = path.join(__dirname, "../commands");
    const commandDirs = fs.readdirSync(commandsPath);

    for (const dir of commandDirs) {
      const commandFiles = fs
        .readdirSync(path.join(commandsPath, dir))
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const cmdPath = path.join(commandsPath, dir, file);
        const cmdModule = await import(pathToFileURL(cmdPath).href);

        const command: Command = new cmdModule.default(this);
        command.category = dir;

        this.commands.set(command.name, command);
        command.aliases.forEach((alias: string) => {
          this.aliases.set(alias, command.name);
        });

        if (command.slashCommand) {
          const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
            name: command.name,
            description: command.description.content,
            type: ApplicationCommandType.ChatInput,
            options: command.options || [],
            default_member_permissions:
              Array.isArray(command.permissions.user) &&
              command.permissions.user.length > 0
                ? PermissionsBitField.resolve(
                    command.permissions.user as any
                  ).toString()
                : null,
            name_localizations: null,
            description_localizations: null,
          };
          this.body.push(data);
        }
      }
    }
  }

  public async deployCommands(guildId?: string): Promise<void> {
    const route = guildId
      ? Routes.applicationGuildCommands(this.user?.id ?? "", guildId)
      : Routes.applicationCommands(this.user?.id ?? "");

    try {
      const rest = new REST({ version: "10" }).setToken(token.token ?? "");
      await rest.put(route, { body: this.body });
      this.logger.success("Successfully deployed slash commands!");
    } catch (error) {
      console.error(error);
    }
  }

  private async loadEvents(): Promise<void> {
    const eventsPath = path.join(__dirname, "../events");
    const eventDirs = fs.readdirSync(eventsPath);

    for (const dir of eventDirs) {
      const eventFiles = fs
        .readdirSync(path.join(eventsPath, dir))
        .filter((file) => file.endsWith(".js"));

      for (const file of eventFiles) {
        const eventPath = path.join(eventsPath, dir, file);
        const eventModule = await import(pathToFileURL(eventPath).href);
        const event = new eventModule.default(this, file);

        if (dir === "player") {
          this.manager.on(event.name, (...args: any) => event.run(...args));
        } else if (dir === "node") {
          this.manager.nodeManager.on(event.name, (...args: any) =>
            event.run(...args)
          );
        } else {
          this.on(event.name, (...args) => event.run(...args));
        }
      }
    }
  }
}
