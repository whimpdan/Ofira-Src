import {
  EmbedBuilder,
  GuildTextBasedChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Event, type Bot } from "../../structures/index.js";
import { Track, Player } from "lavalink-client";
import { updateVoiceStatus } from "../../structures/functions.js";

export default class TrackStart extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "trackStart",
    });
  }

  public async run(player: Player, track: Track): Promise<void> {
    const guild = this.client.guilds.cache.get(player.guildId);
    if (!guild) return;

    const channel = guild.channels.cache.get(
      player.textChannelId
    ) as GuildTextBasedChannel;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(this.client.color.main)
      .setAuthor({
        name: "Now Playing",
        iconURL:
          this.client.config.icons[track.info.sourceName] ??
          this.client.user?.displayAvatarURL({ extension: "png" }),
      })
      .setDescription(`**[${track.info.title}](${track.info.uri})**`)
      .addFields(
        { name: "Artist", value: track.info.author || "Unknown", inline: true },
        {
          name: "Duration",
          value: `\`${this.formatDuration(track.info.duration)}\``,
          inline: true,
        },
        {
          name: "Requested By",
          value: track.requester?.toString() || "Unknown",
          inline: true,
        }
      )
      .setThumbnail(track.info.artworkUrl || null);

    const getButtonRow = () =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setEmoji(this.client.emoji.previous)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!player.queue.previous),

        new ButtonBuilder()
          .setCustomId("pause_resume")
          .setEmoji(
            player.paused ? this.client.emoji.resume : this.client.emoji.pause
          )
          .setStyle(
            player.paused ? ButtonStyle.Success : ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId("skip")
          .setEmoji(this.client.emoji.skip)
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("loop")
          .setEmoji(
            player.repeatMode === "off"
              ? this.client.emoji.loop
              : player.repeatMode === "track"
              ? this.client.emoji.loop1
              : this.client.emoji.loop
          )
          .setStyle(
            player.repeatMode !== "off"
              ? ButtonStyle.Success
              : ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId("stop")
          .setEmoji(this.client.emoji.stop)
          .setStyle(ButtonStyle.Danger)
      );

    const message = await channel.send({
      embeds: [embed],
      components: [getButtonRow()],
    });

    player.set("messageId", message.id);

    const collector = message.createMessageComponentCollector({
      filter: (interaction) =>
        ["skip", "previous", "stop", "loop", "pause_resume"].includes(
          interaction.customId
        ),
      time: track.info.duration,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.isButton()) return;
      const user = interaction.user;
      const member = await interaction.guild?.members.fetch(user.id);
      const userVoiceChannel = member?.voice.channel;
      const botVoiceChannel = guild.members.me?.voice.channel;

      if (!userVoiceChannel || userVoiceChannel.id !== botVoiceChannel?.id) {
        return interaction.reply({
          content: `${this.client.emoji.cross} You must be in the same voice channel as the bot to use this buttons!`,
          flags: 64,
        });
      }

      switch (interaction.customId) {
        case "skip":
          if (player.queue.tracks.length === 0) {
            await interaction.reply({
              content:
                "You cannot skip as there are no more tracks in the queue.",
              flags: 64,
            });
            return;
          }
          await player.skip();
          await interaction.reply({
            content: `⏭ **${user.username}** skipped the current track.`,
          });
          break;

        case "pause_resume":
          if (player.paused) {
            await player.resume();
          } else {
            await player.pause();
          }
          await interaction.update({
            components: [getButtonRow()],
          });
          break;

        case "previous":
          const previous = await player.queue.shiftPrevious();
          if (previous) {
            await player.play({ clientTrack: previous });
            await interaction.reply({
              content: `⏮ **${user.username}** played the previous track.`,
            });
          } else {
            await interaction.reply({
              content: "No previous track available.",
              flags: 64,
            });
          }
          break;

        case "stop":
          player.stopPlaying(true, false);
          await interaction.reply({
            content: `⏹ **${user.username}** stopped playback.`,
          });
          break;

        case "loop":
          switch (player.repeatMode) {
            case "off":
              await player.setRepeatMode("track");
              break;
            case "track":
              await player.setRepeatMode("queue");
              break;
            case "queue":
              await player.setRepeatMode("off");
              break;
          }
          await interaction.update({
            components: [getButtonRow()],
          });
          break;
      }
    });

    await updateVoiceStatus(player, this.client);
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}
