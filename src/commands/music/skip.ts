import { Command, type Context, type Bot } from "../../structures/index.js";

export default class Skip extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "skip",
      description: {
        content: "Skips the current playing song.",
        examples: ["skip"],
        usage: "skip",
      },
      category: "Music",
      aliases: ["s"],
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

    if (!player || !player.queue.current) {
      return await ctx.sendMessage({
        embeds: [
          this.client
            .embed()
            .setColor(this.client.color.red)
            .setDescription("There is no song currently playing."),
        ],
      });
    }

    if (player.queue.tracks.length === 0) {
      return await ctx.sendMessage({
        embeds: [
          this.client
            .embed()
            .setColor(this.client.color.red)
            .setDescription("There are no more songs in the queue to skip."),
        ],
      });
    }

    await player.skip();

    return await ctx.sendMessage({
      embeds: [
        this.client
          .embed()
          .setColor(this.client.color.main)
          .setDescription("Skipped the current song."),
      ],
    });
  }
}
