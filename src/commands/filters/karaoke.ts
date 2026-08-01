import { Command, type Context, type Bot } from "../../structures/index.js";
import { GuildMember } from "discord.js";

export default class Karaoke extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "karaoke",
      description: {
        content: "Toggles the Karaoke filter.",
        examples: ["karaoke"],
        usage: "karaoke",
      },
      category: "filters",
      aliases: ["karaokefilter"],
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
    const member = ctx.member as GuildMember;
    const player = client.manager.getPlayer(ctx.guild.id);

    await player.filterManager.toggleKaraoke();
    const enabled = player.filterManager.filters.karaoke;
    return ctx.sendMessage({
      embeds: [
        client
          .embed()
          .setColor(client.color.main)
          .setDescription(
            `${client.emoji.tick} ${
              enabled ? "Applied" : "Disabled"
            } Karaoke filter.`
          ),
      ],
    });
  }
}
