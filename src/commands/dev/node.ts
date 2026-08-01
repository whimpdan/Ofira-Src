import { Command, type Context, type Bot } from "../../structures/index.js";
import { NodeManager } from "lavalink-client";

export default class Node extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "node",
      description: {
        content: "Displays Lavalink node statistics.",
        examples: ["node"],
        usage: "node",
      },
      category: "dev",
      aliases: ["lavalink"],
      cooldown: 3,
      args: false,
      permissions: {
        dev: true,
        client: [
          "SendMessages",
          "ReadMessageHistory",
          "ViewChannel",
          "EmbedLinks",
        ],
        user: [],
      },
      slashCommand: false,
      options: [],
    });
  }

  public async run(client: Bot, ctx: Context): Promise<any> {
    const embed = client
      .embed()
      .setTitle("Lavalink Node Stats")
      .setColor(client.color.main)
      .setThumbnail(client.user!.avatarURL() || "")
      .setTimestamp();

    const manager: NodeManager = client.manager.nodeManager;

    if (!manager.nodes.size) {
      return ctx.sendMessage({
        embeds: [embed.setDescription("No Lavalink nodes are available.")],
      });
    }

    manager.nodes.forEach((node) => {
      const stats = node.stats;
      if (!stats) return;

      try {
        embed.addFields(
          {
            name: "Name",
            value: `${node.id} (${node.connected ? "🟢" : "🔴"})`,
            inline: true,
          },
          { name: "Players", value: `${stats.players}`, inline: true },
          {
            name: "Playing Players",
            value: `${stats.playingPlayers}`,
            inline: true,
          },
          { name: "Uptime", value: formatTime(stats.uptime), inline: true },
          { name: "Cores", value: `${stats.cpu.cores} Core(s)`, inline: true },
          {
            name: "Memory Usage",
            value: `${formatBytes(stats.memory.used)}/${formatBytes(
              stats.memory.reservable
            )}`,
            inline: true,
          },
          {
            name: "System Load",
            value: `${(stats.cpu.systemLoad * 100).toFixed(2)}%`,
            inline: true,
          },
          {
            name: "Lavalink Load",
            value: `${(stats.cpu.lavalinkLoad * 100).toFixed(2)}%`,
            inline: true,
          }
        );
      } catch (error) {
        console.error(error);
      }
    });

    const sentMessage = await ctx.sendMessage({ embeds: [embed] });

    setTimeout(() => {
      sentMessage.delete().catch(() => {});
    }, 30 * 1000);
  }
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${
    sizes[i]
  }`;
}
