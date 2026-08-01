import type {
  APIApplicationCommandOption,
  PermissionResolvable,
} from "discord.js";
import type Bot from "./client.js";

interface CommandDescription {
  content: string;
  usage: string;
  examples: string[];
}

interface CommandPermissions {
  dev: boolean;
  client: string[] | PermissionResolvable;
  user: string[] | PermissionResolvable;
}

interface CommandCheck {
  inVc?: boolean;
  player?: boolean;
  sameVc?: boolean;
  connect?: boolean;
}

interface CommandOptions {
  name: string;
  name_localizations?: Record<string, string>;
  description?: Partial<CommandDescription>;
  description_localizations?: Record<string, string>;
  aliases?: string[];
  cooldown?: number;
  args?: boolean;
  premium?: boolean;
  permissions?: Partial<CommandPermissions>;
  slashCommand?: boolean;
  options?: APIApplicationCommandOption[];
  category?: string;
  check?: Partial<CommandCheck>;
}

export default class Command {
  public client: Bot;
  public name: string;
  public name_localizations?: Record<string, string>;
  public description: CommandDescription;
  public description_localizations?: Record<string, string>;
  public aliases: string[];
  public cooldown: number;
  public args: boolean;
  public premium: boolean;
  public permissions: CommandPermissions;
  public slashCommand: boolean;
  public options: APIApplicationCommandOption[];
  public category: string;
  public check: Partial<CommandCheck>;

  constructor(client: Bot, options: CommandOptions) {
    this.client = client;
    this.name = options.name;
    this.name_localizations = options.name_localizations ?? {};
    this.description = {
      content: options.description?.content ?? "No description provided",
      usage: options.description?.usage ?? "No usage provided",
      examples: options.description?.examples ?? ["No examples provided"],
    };
    this.description_localizations = options.description_localizations ?? {};
    this.aliases = options.aliases ?? [];
    this.cooldown = options.cooldown ?? 3;
    this.args = options.args ?? false;
    this.premium = options.premium ?? false;
    this.permissions = {
      dev: options.permissions?.dev ?? false,
      client: options.permissions?.client ?? [
        "SendMessages",
        "ViewChannel",
        "EmbedLinks",
      ],
      user: options.permissions?.user ?? [],
    };
    this.slashCommand = options.slashCommand ?? false;
    this.options = options.options ?? [];
    this.category = options.category ?? "general";
    this.check = options.check ?? {};
  }

  public async run(_client: Bot, _message: any, _args: string[]): Promise<any> {
    return await Promise.resolve();
  }
}