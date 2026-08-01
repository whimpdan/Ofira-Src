import { Command, type Context, type Bot } from "../../structures/index.js";
import IgnoreChannel from "../../db/ignoreChannelSchema.js";

export default class RemoveIgnoreChannel extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "ignorechannelremove",
      description: {
        content: "Remove a channel from the ignore list.",
        examples: ["ignorechannelremove <index>"],
        usage: "ignorechannelremove <index>",
      },
      category: "configuration",
      aliases: ["ignoreremove"],
      cooldown: 3,
      args: true,
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
            description: "No ignored channels found for this server!",
            color: this.client.color.red,
          },
        ],
      });
    }

    const index = parseInt(ctx.args[0], 10);
    if (isNaN(index) || index < 1 || index > guildData.IgnoredChannels.length) {
      return ctx.sendMessage({
        embeds: [
          {
            description:
              "Invalid index! Use `ignorechannellist` to check valid indexes.",
            color: this.client.color.red,
          },
        ],
      });
    }

    const removedChannelId = guildData.IgnoredChannels.splice(index - 1, 1)[0];
    await guildData.save();

    return ctx.sendMessage({
      embeds: [
        {
          description: `${this.client.emoji.tick} Removed **<#${removedChannelId}>** from ignored channels.`,
          color: this.client.color.main,
        },
      ],
    });
  }
}
