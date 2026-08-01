import { Command, type Context, type Bot } from "../../structures/index.js";
import UserPremium from "../../db/userPremium.js";
import PremiumServer from "../../db/serverPremium.js";

export default class Profile extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "profile",
      description: {
        content:
          "View your premium profile with credits and activated servers.",
        examples: ["profile"],
        usage: "profile",
      },
      category: "utility",
      aliases: ["mypremium"],
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

    const userPremium = await UserPremium.findOne({ userId: user.id });
    const credits = userPremium ? userPremium.credits : 0;

    const premiumServers = await PremiumServer.find({ activatedBy: user.id });

    const serverNames = premiumServers.length
      ? premiumServers
          .map((server) => {
            const guild = client.guilds.cache.get(server.guildId);
            return guild
              ? guild.name
              : `Unknown Server (ID: ${server.guildId})`;
          })
          .join("\n")
      : "No premium activated in any server.";

    const embed = client
      .embed()
      .setTitle(`${user.tag}'s Premium Profile`)
      .setThumbnail(user.displayAvatarURL({ size: 512 }))
      .setDescription(
        `**Premium Credits**: ${credits}\n\n**Activated Premium in Servers**:\n${serverNames}`
      )
      .setColor(client.color.main)
      .setFooter({
        text: `Requested by ${user.tag}`,
        iconURL: user.displayAvatarURL({ size: 128 }),
      })
      .setTimestamp();

    await ctx.sendMessage({ embeds: [embed] });
  }
}
