import { Command, type Context, type Bot } from "../../structures/index.js";
import db from "../../db/prefix.js";

export default class Prefix extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "prefix",
      description: {
        content: "Shows the bot's prefix",
        examples: ["prefix set", "prefix reset", "prefix set !"],
        usage: "prefix set, prefix reset, prefix set !",
      },
      category: "configuration",
      aliases: ["prefix"],
      cooldown: 3,
      args: true,
      premium: true,
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: ["ManageGuild"],
      },
      slashCommand: true,
      options: [
        {
          name: "set",
          description: "Sets the prefix",
          type: 1,
          options: [
            {
              name: "prefix",
              description: "The prefix you want to set",
              type: 3,
              required: true,
            },
          ],
        },
        {
          name: "reset",
          description: "Resets the prefix to the default one",
          type: 1,
        },
      ],
    });
  }

  public async run(client: Bot, ctx: Context, args?: string[]): Promise<any> {
    const embed = client.embed().setColor(client.color.main);
    let prefix = await db.findOne({ serverId: ctx.guild?.id });
    let subCommand: string;
    let pre: string | undefined;

    if (ctx.isInteraction) {
      const interaction = ctx.interaction as any;

      subCommand = interaction?.options?.data[0]?.name;
      pre = interaction.options.getString("prefix") ?? "";
    } else {
      subCommand = args[0] || "";
      pre = args[1] || "";
    }

    switch (subCommand) {
      case "set":
        if (!pre) {
          embed.setDescription(
            `The prefix for this server is \`${
              prefix ? prefix.prefix : client.config.prefix
            }\``
          );
          return await ctx.sendMessage({ embeds: [embed] });
        }
        if (pre.length > 3) {
          return await ctx.sendMessage({
            embeds: [
              embed.setDescription(
                `${client.emoji.cross} The prefix can't be longer than 3 characters`
              ),
            ],
          });
        }
        if (!prefix) {
          const newPrefix = new db({ serverId: ctx.guild?.id, prefix: pre });
          await newPrefix.save();

          return await ctx.sendMessage({
            embeds: [
              embed.setDescription(
                `${client.emoji.tick} The prefix for this server is now \`${pre}\``
              ),
            ],
          });
        } else {
          await prefix.updateOne({ prefix: pre });
          return await ctx.sendMessage({
            embeds: [
              embed.setDescription(
                `${client.emoji.tick} The prefix for this server is now \`${pre}\``
              ),
            ],
          });
        }

      case "reset":
        if (!prefix) {
          return await ctx.sendMessage({
            embeds: [
              embed.setDescription(
                `${client.emoji.tick} The prefix for this server is \`${client.config.prefix}\``
              ),
            ],
          });
        }
        await db.findOneAndDelete({ serverId: ctx.guild?.id });
        return await ctx.sendMessage({
          embeds: [
            embed.setDescription(
              `${client.emoji.tick} The prefix for this server is now \`${client.config.prefix}\``
            ),
          ],
        });
    }
  }
}
