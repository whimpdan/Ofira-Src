import { Command, type Context, type Bot } from "../../structures/index.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default class Support extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "support",
      description: {
        content: "Get the link to the support server or contact support.",
        examples: ["support"],
        usage: "support",
      },
      category: "utility",
      aliases: ["helpdesk", "supportserver"],
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

  public async run(_client: Bot, ctx: Context): Promise<any> {
    const embed = this.client
      .embed()
      .setAuthor({
        name: `${this.client.user.username} Support`,
        iconURL: this.client.user.displayAvatarURL(),
      })
      .setColor(this.client.color.main)
      .setDescription(
        `Need help or want to stay updated? Join our support server for assistance, updates, and more! Click the button below to join.`
      )
      .setThumbnail(this.client.user.displayAvatarURL())
      .setFooter({
        text: `Requested by ${ctx.author.tag}`,
        iconURL: ctx.author.displayAvatarURL(),
      })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(ButtonStyle.Link)
        .setURL(`${this.client.config.ssLink}`)
    );

    return await ctx.sendMessage({
      embeds: [embed],
      components: [row],
    });
  }
}
