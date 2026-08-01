import { Command, type Context, type Bot } from "../../structures/index.js";
import IgnoreChannel from "../../db/ignoreChannelSchema.js";
import { ChannelType } from "discord.js";

export default class AddIgnoreChannel extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "ignorechanneladd",
      description: {
        content: "Add a channel to the ignore list.",
        examples: ["ignorechanneladd #channel"],
        usage: "ignorechanneladd <#channel>",
      },
      category: "configuration",
      aliases: ["ignoreadd"],
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
    const channel =
      ctx.message.mentions.channels.first() ||
      ctx.guild.channels.cache.get(ctx.args[0]);

    if (!channel || channel.type !== ChannelType.GuildText) {
      return ctx.sendMessage({
        embeds: [
          {
            description: "Please provide a valid text channel to ignore.",
            color: this.client.color.red,
          },
        ],
      });
    }

    let guildData =
      (await IgnoreChannel.findOne({ GuildId: ctx.guild.id })) ||
      new IgnoreChannel({ GuildId: ctx.guild.id, IgnoredChannels: [] });

    if (guildData.IgnoredChannels.includes(channel.id)) {
      return ctx.sendMessage({
        embeds: [
          {
            description: `**<#${channel.id}>** is already in the ignored list!`,
            color: this.client.color.red,
          },
        ],
      });
    }

    guildData.IgnoredChannels.push(channel.id);
    await guildData.save();

    return ctx.sendMessage({
      embeds: [
        {
          description: `${this.client.emoji.tick} **<#${channel.id}>** has been added to ignored channels.`,
          color: this.client.color.main,
        },
      ],
    });
  }
}
