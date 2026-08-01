import { Command, type Context, type Bot } from "../../structures/index.js";

export default class Volume extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "volume",
      description: {
        content: "Adjusts or shows the player's volume.",
        examples: ["volume", "volume 50"],
        usage: "volume <1-100>",
      },
      category: "Music",
      aliases: ["vol"],
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
      options: [
        {
          name: "volume",
          description: "The volume level to set (1-100).",
          type: 4,
          required: false,
        },
      ],
    });
  }

  public async run(_client: Bot, ctx: Context, args: string[]): Promise<any> {
    const player = this.client.manager.getPlayer(ctx.guild.id);

    if (!args.length) {
      return await ctx.sendMessage({
        embeds: [
          this.client
            .embed()
            .setColor(this.client.color.main)
            .setDescription(`The current volume is **${player.volume}%**.`),
        ],
      });
    }

    const volume = parseInt(args[0]);

    if (isNaN(volume) || volume < 1 || volume > 100) {
      return await ctx.sendMessage({
        embeds: [
          this.client
            .embed()
            .setColor(this.client.color.red)
            .setDescription(
              "Please provide a valid volume level between 1 and 100."
            ),
        ],
      });
    }

    await player.setVolume(volume);

    return await ctx.sendMessage({
      embeds: [
        this.client
          .embed()
          .setColor(this.client.color.main)
          .setDescription(`Set the volume to **${volume}%**.`),
      ],
    });
  }
}
