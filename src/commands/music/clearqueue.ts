import { Command, type Context, type Bot } from "../../structures/index.js";

export default class ClearQueue extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "clearqueue",
      description: {
        content: "Clears the current music queue.",
        examples: ["clearqueue"],
        usage: "clearqueue",
      },
      category: "Music",
      aliases: ["cq"],
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
    if (!player.queue.tracks.length) {
      return ctx.sendMessage({
        embeds: [
          this.client
            .embed()
            .setColor(this.client.color.red)
            .setDescription("The queue is already empty."),
        ],
      });
    }

    player.queue.tracks.splice(0, player.queue.tracks.length);

    return await ctx.sendMessage({
      embeds: [
        this.client
          .embed()
          .setColor(this.client.color.main)
          .setDescription("Successfully cleared the queue."),
      ],
    });
  }
}
