import { Command, type Context, type Bot } from "../../structures/index.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default class Invite extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "invite",
      description: {
        content: "Get the invite link.",
        examples: ["invite"],
        usage: "invite",
      },
      category: "utility",
      aliases: ["inv"],
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
        name: `${this.client.user.username} Invite`,
        iconURL: this.client.user.displayAvatarURL(),
      })
      .setColor(this.client.color.main)
      .setDescription(
        `Use the buttons below to invite the bot or join the support server.`
      );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Invite Me")
        .setStyle(ButtonStyle.Link)
        .setURL(this.client.config.invite),

      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(ButtonStyle.Link)
        .setURL(this.client.config.ssLink)
    );

    return await ctx.sendMessage({
      embeds: [embed],
      components: [row],
    });
  }
}
