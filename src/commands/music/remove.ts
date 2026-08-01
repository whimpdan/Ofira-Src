import { Command, type Context, type Bot } from "../../structures/index.js";

export default class Remove extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "remove",
      description: {
        content: "Removes a song from the queue using its index number.",
        examples: ["remove 2"],
        usage: "remove <index>",
      },
      category: "Music",
      aliases: ["rm"],
      cooldown: 3,
      args: true,

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
      options: [
        {
          name: "index",
          description: "The index of the song to remove.",
          type: 4,
          required: true,
        },
      ],
    });
  }

  public async run(client: Bot, ctx: Context, args: string[]): Promise<any> {
    const player = client.manager.getPlayer(ctx.guild.id);

    if (!player || !player.queue.tracks.length) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription("The queue is empty."),
        ],
      });
    }

    const index = parseInt(args[0]) - 1;

    if (isNaN(index) || index < 0 || index >= player.queue.tracks.length) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription("Please provide a valid index number."),
        ],
      });
    }

    const removedTrack = player.queue.tracks.splice(index, 1)[0];

    return ctx.sendMessage({
      embeds: [
        client
          .embed()
          .setColor(client.color.main)
          .setDescription(
            `Removed **[${removedTrack.info.title}](${removedTrack.info.uri})** from the queue.`
          ),
      ],
    });
  }
}
