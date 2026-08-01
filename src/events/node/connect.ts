import { Event, type Bot } from "../../structures/index.js";
import reconnectAuto from "../../db/247.js";
import { LavalinkNode } from "lavalink-client";
import { Guild, VoiceChannel, PermissionFlagsBits } from "discord.js";

export default class Connect extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "connect",
    });
  }

  public async run(node: LavalinkNode): Promise<void> {
    this.client.logger.success(`Lavalink Node ${node.id} connected!`);

    try {
      const savedGuilds = await reconnectAuto.find();
      let connected = 0;

      for (const { GuildId, VoiceId, TextId } of savedGuilds) {
        const guild: Guild | undefined = this.client.guilds.cache.get(GuildId);
        if (!guild) continue;

        const voiceChannel = guild.channels.cache.get(VoiceId) as VoiceChannel;
        if (!voiceChannel?.isVoiceBased()) continue;

        const bot = guild.members.me;
        const perms = voiceChannel.permissionsFor(bot!);

        if (
          !perms?.has(PermissionFlagsBits.ViewChannel) ||
          !perms.has(PermissionFlagsBits.Connect) ||
          !perms.has(PermissionFlagsBits.Speak)
        ) {
          this.client.logger.warn(
            `Missing permissions for VC: ${voiceChannel.name} in guild: ${guild.name}`
          );
          continue;
        }

        const player = this.client.manager.createPlayer({
          guildId: GuildId,
          voiceChannelId: VoiceId,
          textChannelId: TextId,
          selfDeaf: true,
          volume: 80,
        });

        await player.connect();
        connected++;
      }

      this.client.logger.success(
        `Reconnected to ${connected} saved voice channels from MongoDB.`
      );
    } catch (error) {
      this.client.logger.error(`247 auto-reconnect failed: ${error}`);
    }
  }
}
