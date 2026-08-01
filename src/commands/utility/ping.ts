import { Command, type Context, type Bot } from "../../structures/index.js";

export default class Ping extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "ping",
      description: {
        content: "Check the bot's responsiveness.",
        examples: ["ping"],
        usage: "ping",
      },
      category: "Utility",
      aliases: ["pong"],
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
    const messageLatency = Date.now() - ctx.createdTimestamp;
    const wsPing = Math.round(ctx.client.ws.ping);

    const embed = this.client
      .embed()
      .setColor(this.client.color.main)
      .setTitle("Pong")
      .setDescription(
        `Message Latency: ${messageLatency}ms\nWebSocket Ping: ${wsPing}ms`
      );

    return await ctx.sendMessage({ embeds: [embed] });
  }
}
