import type { TextChannel } from "discord.js";
import type { Player } from "lavalink-client";
import { Event, type Bot } from "../../structures/index.js";

export default class TrackEnd extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "trackEnd",
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
      if (!message) return;

      await message.edit({ components: [] }).catch(() => null);
    } catch (error) {
      console.error("Failed to edit track end message:", error);
    }
  }
}
