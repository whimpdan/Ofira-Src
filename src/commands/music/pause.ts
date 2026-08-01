import { Command, type Context, type Bot } from "../../structures/index.js";

export default class Pause extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "pause",
      description: {
        content: "Pauses the currently playing song.",
        examples: ["pause"],
        usage: "pause",
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

    if (player.paused) {
      return await ctx.sendMessage({
        embeds: [
          this.client
            .embed()
            .setColor(this.client.color.red)
            .setDescription("The player is already paused."),
        ],
      });
    }

    await player.pause();

    return await ctx.sendMessage({
      embeds: [
        this.client
          .embed()
          .setColor(this.client.color.main)
          .setDescription("Paused the current song."),
      ],
    });
  }
}
