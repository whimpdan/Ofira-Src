import { Command, type Context, type Bot } from "../../structures/index.js";

export default class Uptime extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "uptime",
      description: {
        content: "Shows how long the bot has been online.",
        examples: ["uptime"],
        usage: "uptime",
      },
      category: "Utility",
      aliases: ["up"],
      cooldown: 3,
      args: false,
      
      permissions: {
        dev: false,
        client: [
          "SendMessages",
          "ReadMessageHistory",
          "ViewChannel",
          "EmbedLinks",
        ],
        user: [],
      },
      slashCommand: true,
      options: [],
    });
  }

  public async run(_client: Bot, ctx: Context): Promise<any> {
    const uptime = this.client.uptime || 0;

    if (uptime === 0) {
      return ctx.sendMessage({
        embeds: [
          this.client
            .embed()
            .setColor(this.client.color.red)
            .setDescription("Unable to fetch bot uptime."),
        ],
      });
    }

    const uptimeFormatted = this.formatDuration(uptime);

    const embed = this.client
      .embed()
      .setAuthor({
        name: "⏳ Bot Uptime",
        iconURL: this.client.user.displayAvatarURL(),
      })
      .setColor(this.client.color.main)
      .setDescription(`**${uptimeFormatted}**`)
      .setTimestamp();

    return ctx.sendMessage({ embeds: [embed] });
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
}
