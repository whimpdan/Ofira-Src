import { Command, type Context, type Bot } from "../../structures/index.js";

export default class Leave extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "leave",
      description: {
        content: "Makes the bot leave the voice channel.",
        examples: ["leave"],
        usage: "leave",
      },
      category: "Music",
      aliases: ["l", "disconnect", "dc"],
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

    try {
      await player.destroy();

      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.main)
            .setDescription(`${client.emoji.tick} Left the voice channel.`),
        ],
      });
    } catch (error) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.cross} Failed to leave the voice channel.`
            ),
        ],
      });
    }
  }
}
