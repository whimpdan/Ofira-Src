import { Command, type Context, type Bot } from "../../structures/index.js";
import { GuildMember } from "discord.js";

export default class LowPass extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "lowpass",
      description: {
        content: "Toggles the lowpass filter.",
        examples: ["lowpass"],
        usage: "lowpass",
      },
      category: "filters",
      aliases: ["lp"],
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

    await player.filterManager.toggleLowPass();
    const enabled = player.filterManager.filters.lowPass;
    return ctx.sendMessage({
      embeds: [
        client
          .embed()
          .setColor(client.color.main)
          .setDescription(
            `${client.emoji.tick} ${
              enabled ? "Applied" : "Disabled"
            } Lowpass filter.`
          ),
      ],
    });
  }
}
