import { Command, type Context, type Bot } from "../../structures/index.js";
import UserPremium from "../../db/userPremium.js";

export default class AddPremium extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "premium",
      description: {
        content: "Assign premium credits to a user.",
        examples: ["premium @user 2"],
        usage: "premium <@user> <credits>",
      },
      category: "dev",
      aliases: ["addpremium"],
      cooldown: 3,
      args: true,

      permissions: {
        dev: true,
        client: [
          "SendMessages",
          "ReadMessageHistory",
          "ViewChannel",
          "EmbedLinks",
        ],
        user: ["Administrator"],
      },
      slashCommand: false,
      options: [],
    });
  }

  public async run(client: Bot, ctx: Context): Promise<any> {
    const user = ctx.message.mentions.users.first();
    const credits = parseInt(ctx.args[1], 10);

    if (!user || isNaN(credits)) {
      const embed = client
        .embed()
        .setDescription("Usage: `premium <@user> <credits>`")
        .setColor(client.color.main);
      return ctx.sendMessage({ embeds: [embed] });
    }

    await UserPremium.findOneAndUpdate(
      { userId: user.id },
      { $inc: { credits: credits } },
      { new: true, upsert: true }
    );

    const embed = client
      .embed()
      .setDescription(
        `Successfully added **${credits}** premium credits to **${user.tag}**.`
      )
      .setColor(client.color.main);

    ctx.sendMessage({ embeds: [embed] });
  }
}
