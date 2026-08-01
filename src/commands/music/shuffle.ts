import { Command, type Context, type Bot } from "../../structures/index.js";

export default class Shuffle extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "shuffle",
      description: {
        content: "Shuffles the music queue.",
        examples: ["shuffle"],
        usage: "shuffle",
      },
      category: "Music",
      aliases: ["mix"],
      cooldown: 3,
      args: false,

      permissions: {
        dev: false,
        client: [
          "Connect",
          "Speak",
          "SendMessages",
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

  public async run(client: Bot, ctx: Context): Promise<any> {
    const player = client.manager.players.get(ctx.guild.id);

    if (!player || !player.connected) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.cross} I am not in a voice channel.`
            ),
        ],
      });
    }

    if (player.queue.tracks.length <= 1) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.cross} There is only one song or the queue is empty. Nothing to shuffle.`
            ),
        ],
      });
    }

    await player.queue.shuffle();

    return ctx.sendMessage({
      embeds: [
        client
          .embed()
          .setColor(client.color.main)
          .setDescription(`${client.emoji.tick} Queue shuffled.`),
      ],
    });
  }
}
