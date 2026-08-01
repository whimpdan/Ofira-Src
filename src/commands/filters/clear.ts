import { Command, type Context, type Bot } from "../../structures/index.js";
import { GuildMember } from "discord.js";

export default class ClearFilter extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "clear",
      description: {
        content: "Clears all active filters.",
        examples: ["clear"],
        usage: "clear",
      },
      category: "filters",
      aliases: ["clearfilters", "resetfilters"],
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

    await player.filterManager.resetFilters();
    return ctx.sendMessage({
      embeds: [
        client
          .embed()
          .setColor(client.color.main)
          .setDescription(`${client.emoji.tick} Cleared all active filters.`),
      ],
    });
  }
}
