import { Command, type Context, type Bot } from "../../structures/index.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import os from "os";

export default class Stats extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "stats",
      description: {
        content: "Displays detailed bot statistics.",
        examples: ["stats"],
        usage: "stats",
      },
      category: "utility",
      aliases: ["botstats", "botinfo"],
      cooldown: 5,
      args: false,

      permissions: {
        dev: false,
        client: ["SendMessages", "EmbedLinks"],
        user: [],
      },
      slashCommand: true,
      options: [],
    });
  }

  public async run(client: Bot, ctx: Context): Promise<any> {
    const shardStats = await client.cluster.broadcastEval((c) => ({
      guilds: c.guilds.cache.size,
      users: c.users.cache.size,
      channels: c.channels.cache.size,
      shardId: c.shard?.ids[0],
    }));

    const totalGuilds = await this.client.cluster
      .broadcastEval((c) => c.guilds.cache.size)
      .then((res) =>
        res.reduce((acc: number, count: number) => acc + count, 0)
      );

    const totalUsers = await client.cluster
      .broadcastEval((c) =>
        c.guilds.cache.map((x) => x.memberCount).reduce((a, b) => a + b, 0)
      )
      .then((x) => x.reduce((a, b) => a + b, 0).toLocaleString());

    const totalShards = client.cluster.info.TOTAL_SHARDS;
    const totalClusters = client.cluster.info.CLUSTER_COUNT;
    const currentShardId = ctx.guild?.shardId ?? 0;
    const currentClusterId = client.cluster.id;

    const botUptime = this.formatDuration(client.uptime || 0);
    const systemUptime = this.formatDuration(os.uptime() * 1000);

    const memoryUsage = process.memoryUsage();
    const memoryStats = {
      rss: (memoryUsage.rss / 1024 / 1024).toFixed(2),
      heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
      heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
    };

    const cpuModel = os.cpus()[0]?.model || "Unknown CPU";
    const cpuCores = os.cpus().length;

    const embed = new EmbedBuilder()
      .setColor(client.color.main)
      .setAuthor({
        name: `${client.user.username} — System & Performance Statistics`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(
        `Below is a detailed overview of ${client.user.username}'s current performance and system status.`
      )
      .addFields(
        {
          name: "General Statistics",
          value:
            `• Total Servers: ${totalGuilds}\n` +
            `• Total Users: ${totalUsers}\n`,
          inline: true,
        },
        {
          name: "System Information",
          value:
            `• CPU: ${cpuModel} (${cpuCores} Cores)\n` +
            `• RAM Usage: ${memoryStats.rss} MB\n` +
            `• Heap Usage: ${memoryStats.heapUsed} MB / ${memoryStats.heapTotal} MB\n`,
          inline: true,
        },
        {
          name: "Sharding Details",
          value:
            `• Total Shards: ${totalShards}\n` +
            `• Total Clusters: ${totalClusters}\n` +
            `• Current Shard: ${currentShardId}\n` +
            `• Current Cluster: ${currentClusterId}\n`,
        },
        {
          name: "Uptime",
          value:
            `• Bot Uptime: ${botUptime}\n` +
            `• System Uptime: ${systemUptime}\n`,
        }
      )
      .setFooter({
        text: `Requested by ${ctx.author.tag}`,
        iconURL: ctx.author.displayAvatarURL(),
      })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Invite Me")
        .setStyle(ButtonStyle.Link)
        .setURL(client.config.invite),
      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(ButtonStyle.Link)
        .setURL(client.config.ssLink)
    );

    return ctx.sendMessage({ embeds: [embed], components: [row] });
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    return [
      days > 0 ? `${days}d` : null,
      hours > 0 ? `${hours}h` : null,
      minutes > 0 ? `${minutes}m` : null,
      `${seconds}s`,
    ]
      .filter((part) => part !== null)
      .join(" ");
  }
}
