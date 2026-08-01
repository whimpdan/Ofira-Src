import { Command, type Context, type Bot } from "../../structures/index.js";
import { EmbedBuilder } from "discord.js";

export default class Autoplay extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "autoplay",
      description: {
        content:
          "Enables autoplay for recommended songs based on the current track's source.",
        examples: ["autoplay"],
        usage: "autoplay",
      },
      category: "Music",
      aliases: ["ap"],
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

  public async run(client: Bot, ctx: Context): Promise<any> {
    const player = client.manager.getPlayer(ctx.guild.id);

    if (!player || !player.queue.current) {
      return ctx.sendMessage({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color.red)
            .setDescription("There is no song currently playing."),
        ],
      });
    }

    const autoplay = player.get<boolean>("autoplay");

    player.set("autoplay", !autoplay);

    const embed = new EmbedBuilder()
      .setColor(client.color.main)
      .setDescription(autoplay ? "Autoplay disabled." : "Autoplay enabled.");

    return ctx.sendMessage({
      embeds: [embed],
    });
  }
}
