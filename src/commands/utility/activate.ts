import { Command, type Context, type Bot } from "../../structures/index.js";
import UserPremium from "../../db/userPremium.js";
import PremiumServer from "../../db/serverPremium.js";

export default class ActivatePremium extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "activatepremium",
      description: {
        content: "Activate premium for your server using your credits.",
        examples: ["activatepremium"],
        usage: "activatepremium",
      },
      category: "utility",
      aliases: ["activate"],
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
      slashCommand: true,
      options: [],
    });
  }

  public async run(client: Bot, ctx: Context): Promise<any> {
    const user = ctx.author;
    const guildId = ctx.guild?.id;

    if (!guildId) {
      const embed = client
        .embed()
        .setDescription("This command can only be used in a server.")
        .setColor(client.color.main);
      return ctx.sendMessage({ embeds: [embed] });
    }

    try {
      const existingPremium = await PremiumServer.findOne({ guildId });
      if (existingPremium && existingPremium.expiryDate > new Date()) {
        const embed = client
          .embed()
          .setDescription("This server already has active premium.")
          .setColor(client.color?.main);
        return ctx.sendMessage({ embeds: [embed] });
      }

      const userPremium = await UserPremium.findOne({ userId: user.id });

      if (!userPremium || userPremium.credits <= 0) {
        const embed = client
          .embed()
          .setDescription("You don't have enough premium credits to activate.")
          .setColor(client.color?.main);
        return ctx.sendMessage({ embeds: [embed] });
      }

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      await PremiumServer.create({
        guildId: guildId,
        activatedBy: user.id,
        activationDate: new Date(),
        expiryDate: expiryDate,
      });

      await UserPremium.updateOne(
        { userId: user.id },
        { $inc: { credits: -1 } }
      );

      if (userPremium.credits - 1 <= 0) {
        await UserPremium.deleteOne({ userId: user.id });
      }

      const embed = client
        .embed()
        .setDescription(
          `Premium activated for this server by **${
            user.tag
          }**. It will expire on **${expiryDate.toLocaleDateString()}**.`
        )
        .setColor(client.color?.main || 0x00ff00);
      return ctx.sendMessage({ embeds: [embed] });
    } catch (error) {
      console.error("Error activating premium:", error);
      const embed = client
        .embed()
        .setDescription(
          "An error occurred while activating premium. Please try again later."
        )
        .setColor(client.color?.main);
      return ctx.sendMessage({ embeds: [embed] });
    }
  }
}
