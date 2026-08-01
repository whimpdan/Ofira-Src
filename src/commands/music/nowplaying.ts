import { Command, type Context, type Bot } from "../../structures/index.js";
import { EmbedBuilder } from "discord.js";

export default class NowPlaying extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "nowplaying",
      description: {
        content: "Displays information about the currently playing song.",
        examples: ["nowplaying"],
        usage: "nowplaying",
      },
      category: "Music",
      aliases: ["np"],
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
      check: {
        inVc: true,
        sameVc: true,
        player: true,
      },
      slashCommand: true,
      options: [],
    });
  }

  public async run(client: Bot, ctx: Context): Promise<any> {
    const player = client.manager.getPlayer(ctx.guild.id);
    if (!player || !player.queue.current) {
      return ctx.sendMessage({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color.red)
            .setDescription("There is no song currently playing."),
        ],
      });
    }

    const track = player.queue.current;
    const currentPosition = player.position;
    const totalDuration = track.info.duration;
    const progressBar = this.createProgressBar(currentPosition, totalDuration);

    const embed = new EmbedBuilder()
      .setColor(client.color.main)
      .setAuthor({ name: "Now Playing" })
      .setThumbnail(track.info.artworkUrl || null)
      .setDescription(`**[${track.info.title}](${track.info.uri})**`)
      .addFields(
        { name: "Author", value: track.info.author || "Unknown", inline: true },
        {
          name: "Requester",
          value: track.requester?.toString() || "Unknown",
          inline: true,
        },
        { name: "Volume", value: `**${player.volume}%**`, inline: true },
        {
          name: "Duration",
          value: track.info.isStream
            ? "Live Stream"
            : `\`${this.formatTime(currentPosition)} / ${this.formatTime(
                totalDuration
              )}\``,
          inline: true,
        },
        { name: "Progress", value: progressBar, inline: false }
      );

    return ctx.sendMessage({
      embeds: [embed],
    });
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${
      remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds
    }`;
  }

  private createProgressBar(current: number, total: number, size = 20): string {
    if (total === 0) return "🔴 Live Stream";
    const percentage = current / total;
    const progress = Math.round(size * percentage);
    const bar = "▬".repeat(size);
    const progressBar =
      bar.substring(0, progress) + "🔘" + bar.substring(progress + 1);
    return `\`${progressBar}\``;
  }
}
