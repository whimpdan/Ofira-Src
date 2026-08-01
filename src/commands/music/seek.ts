import { Command, type Context, type Bot } from "../../structures/index.js";

export default class Seek extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "seek",
      description: {
        content: "Jumps to a specific timestamp in the currently playing song.",
        examples: ["seek 1:30", "seek 90"],
        usage: "seek <timestamp>",
      },
      category: "Music",
      aliases: [],
      cooldown: 3,
      args: true,

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
      options: [
        {
          name: "timestamp",
          description: "The timestamp to jump to (e.g., 1:30 or 90).",
          type: 3,
          required: true,
        },
      ],
    });
  }

  public async run(client: Bot, ctx: Context, args: string[]): Promise<any> {
    const player = client.manager.getPlayer(ctx.guild.id);

    if (!player || !player.queue.current) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription("There is no song currently playing."),
        ],
      });
    }

    const timestamp = args[0];
    const time = this.parseTimestamp(timestamp);

    if (
      time === null ||
      time < 0 ||
      time >= player.queue.current.info.duration
    ) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription("Please provide a valid timestamp."),
        ],
      });
    }

    await player.seek(time);

    return ctx.sendMessage({
      embeds: [
        client
          .embed()
          .setColor(client.color.main)
          .setDescription(
            `Jumped to **${this.formatDuration(time)}** in the song.`
          ),
      ],
    });
  }

  private parseTimestamp(timestamp: string): number | null {
    const parts = timestamp.split(":");
    if (parts.length === 1) {
      const seconds = parseInt(parts[0]);
      return isNaN(seconds) ? null : seconds * 1000;
    } else if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseInt(parts[1]);
      if (isNaN(minutes) || isNaN(seconds)) return null;
      return (minutes * 60 + seconds) * 1000;
    }
    return null;
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}
