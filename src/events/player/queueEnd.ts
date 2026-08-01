import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js";
import type { Player } from "lavalink-client";
import { Event, type Bot } from "../../structures/index.js";
import { updateVoiceStatus } from "../../structures/functions.js";

export default class QueueEnd extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "queueEnd",
    });
  }

  public async run(player: Player): Promise<void> {
    const guild = this.client.guilds.cache.get(player.guildId);
    if (!guild) return;

    const messageId = player.get("messageId");
    if (!messageId) return;

    const channel = guild.channels.cache.get(
      player.textChannelId!
    ) as TextChannel;
    if (!channel) return;

    try {
      const message = await channel.messages.fetch(messageId).catch(() => null);
      if (message) {
        await message.edit({ components: [] }).catch(() => null);
      }

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Invite Me")
          .setURL(`${this.client.config.invite}`)
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel("Support Server")
          .setURL(`${this.client.config.ssLink}`)
          .setStyle(ButtonStyle.Link)
      );

      const embed = this.client
        .embed()
        .setColor(this.client.color.main)
        .setDescription("**The queue has ended! Thank you for listening.**");

      await channel.send({
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      console.error("Failed to handle queue end event:", error);
    }

    await updateVoiceStatus(player, this.client);
  }
}
