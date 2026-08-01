import { Track } from "lavalink-client";
import { Command, type Context, type Bot } from "../../structures/index.js";
import { ChatInputCommandInteraction, type GuildMember } from "discord.js";
import config from "../../config/config.js";

export default class Play extends Command {
  private readonly MAX_PLAYLIST_SIZE = config.maxPlaylistSize;
  private readonly MAX_QUEUE_SIZE = config.maxQueueSize;

  constructor(client: Bot) {
    super(client, {
      name: "play",
      description: {
        content: "Plays a track or adds it to the queue.",
        examples: [
          "play <song name>",
          "play <YouTube URL>",
          "play <Spotify URL>",
        ],
        usage: "play <query|URL>",
      },
      category: "Music",
      aliases: ["p"],
      cooldown: 3,
      args: true,
      permissions: {
        dev: false,
        client: [
          "Connect",
          "Speak",
          "SendMessages",
          "ViewChannel",
          "EmbedLinks",
        ],
        user: [],
      },
      check: {
        inVc: true,
        sameVc: true,
        connect: true,
      },
      slashCommand: true,
      options: [
        {
          name: "query",
          description: "The song name or URL to play.",
          type: 3,
          required: true,
        },
      ],
    });
  }

  public async run(client: Bot, ctx: Context): Promise<any> {
    const member = ctx.member as GuildMember;

    const query =
      ctx.args.join(" ") ||
      (ctx.interaction instanceof ChatInputCommandInteraction
        ? ctx.interaction.options.getString("query")
        : null);

    if (!query) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.cross} Please provide a song name or URL to play.`
            ),
        ],
      });
    }

    if (!member.voice.channel) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.cross} You must be in a voice channel to use this command.`
            ),
        ],
      });
    }

    if (!client.manager.nodeManager.nodes.map((node) => node.connected)) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.cross} No active Lavalink nodes available. Please try again later.`
            ),
        ],
      });
    }

    let player = client.manager.getPlayer(ctx.guild.id);
    if (!player) {
      player = client.manager.createPlayer({
        guildId: ctx.guild?.id,
        voiceChannelId: member.voice?.channelId,
        textChannelId: ctx.channel?.id,
        volume: 80,
        selfDeaf: true,
      });
    }

    if (!player.connected) {
      try {
        await player.connect();
      } catch (error) {
        return ctx.sendMessage({
          embeds: [
            client
              .embed()
              .setColor(client.color.red)
              .setDescription(
                `${client.emoji.cross} Failed to connect to the voice channel. Please try again.`
              ),
          ],
        });
      }
    }

    let searchResult;
    try {
      searchResult = await player.search(query, member);
    } catch (error) {
      console.log(error);
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.cross} An error occurred while searching for your query.`
            ),
        ],
      });
    }

    if (!searchResult || !searchResult.tracks?.length) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.cross} No results found for your query.`
            ),
        ],
      });
    }

    if (searchResult.loadType === "playlist") {
      if (searchResult.tracks.length > this.MAX_PLAYLIST_SIZE) {
        return ctx.sendMessage({
          embeds: [
            client
              .embed()
              .setColor(client.color.red)
              .setDescription(
                `${client.emoji.info} Playlist exceeds the limit of **${this.MAX_PLAYLIST_SIZE}** tracks. Please choose a smaller playlist.`
              ),
          ],
        });
      }

      if (
        player.queue.tracks.length + searchResult.tracks.length >
        this.MAX_QUEUE_SIZE
      ) {
        return ctx.sendMessage({
          embeds: [
            client
              .embed()
              .setColor(client.color.red)
              .setDescription(
                `${client.emoji.info} Adding this playlist would exceed the queue limit of **${this.MAX_QUEUE_SIZE}** tracks.`
              ),
          ],
        });
      }

      searchResult.tracks.forEach((track) => player.queue.add(track));

      ctx.sendMessage({
        content: `${client.emoji.info} Loaded playlist: **${searchResult.playlist.name}** with **(\`${searchResult.tracks.length}\`)** tracks by **${ctx.author.username}**.`,
      });
    } else {
      if (player.queue.tracks.length >= this.MAX_QUEUE_SIZE) {
        return ctx.sendMessage({
          embeds: [
            client
              .embed()
              .setColor(client.color.red)
              .setDescription(
                `${client.emoji.info} The queue has reached its maximum limit of **${this.MAX_QUEUE_SIZE}** tracks.`
              ),
          ],
        });
      }

      const track = searchResult.tracks[0] as Track;
      track.requester = ctx.author;
      player.queue.add(track);

      ctx.sendMessage({
        content: `${client.emoji.info} Added to Queue: **${
          track.info.title
        } (\`${this.formatDuration(track.info.duration)}\`)** by **${
          ctx.author.username
        }**.`,
      });
    }

    if (player.queue.tracks.length > 0) {
      try {
        if (!player.connected) {
          await player.connect();
        }
        if (player.paused) {
          await player.resume();
        }
        if (!player.playing) {
          await player.play();
        }
      } catch (error) {
        return ctx.sendMessage({
          embeds: [
            client
              .embed()
              .setColor(client.color.red)
              .setDescription(
                `${client.emoji.cross} An error occurred while trying to play the track.`
              ),
          ],
        });
      }
    }
  }

  private formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  }
}
