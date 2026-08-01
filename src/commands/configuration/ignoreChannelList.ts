import { Command, type Context, type Bot } from "../../structures/index.js";
import IgnoreChannel from "../../db/ignoreChannelSchema.js";

export default class ListIgnoreChannels extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "ignorechannellist",
      description: {
        content: "List all ignored channels.",
        examples: ["ignorechannellist"],
        usage: "ignorechannellist",
      },
      category: "configuration",
      aliases: ["ignorelist"],
      cooldown: 3,
      args: false,
      premium: true,
      permissions: {
        dev: false,
        client: [
          "SendMessages",
          "ReadMessageHistory",
          "ViewChannel",
          "EmbedLinks",
        ],
        user: ["ManageGuild"],
      },
      slashCommand: false,
    });
  }

  public async run(_client: Bot, ctx: Context): Promise<any> {
    let guildData = await IgnoreChannel.findOne({ GuildId: ctx.guild.id });

    if (!guildData || guildData.IgnoredChannels.length === 0) {
      return ctx.sendMessage({
        embeds: [
          {
            description: "No channels are currently ignored.",
            color: this.client.color.red,
          },
        ],
      });
    }

    const ignoredChannelsList = guildData.IgnoredChannels.map(
      (id, idx) => `**${idx + 1}.** <#${id}>`
    ).join("\n");

    return ctx.sendMessage({
      embeds: [
        {
          title: "Ignored Channels",
          description: ignoredChannelsList,
          color: this.client.color.main,
        },
      ],
    });
  }
}
