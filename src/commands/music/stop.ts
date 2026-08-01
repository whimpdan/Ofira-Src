import { Command, type Context, type Bot } from "../../structures/index.js";

export default class Stop extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "stop",
      description: {
        content: "Stops the player and clears the queue.",
        examples: ["stop"],
        usage: "stop",
      },
      category: "Music",
      aliases: [],
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
      check: {
        inVc: true,
        sameVc: true,
        player: true,
      },
      slashCommand: true,
      options: [],
    });
  }

  public async run(_client: Bot, ctx: Context): Promise<any> {
    const player = this.client.manager.getPlayer(ctx.guild.id);

    await player.stopPlaying(true, false);

    return await ctx.sendMessage({
      embeds: [
        this.client
          .embed()
          .setColor(this.client.color.main)
          .setDescription("Stopped the player and cleared the queue."),
      ],
    });
  }
}
