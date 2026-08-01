import { Command, type Context, type Bot } from "../../structures/index.js";
import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} from "discord.js";
import { Track, SearchResult } from "lavalink-client";

export default class Search extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "search",
      description: {
        content: "Search for a song and add it to the queue.",
        examples: ["search <song name>"],
        usage: "search <song name>",
      },
      category: "Music",
      aliases: ["sr"],
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
        player: false,
        connect: true,
      },
      slashCommand: true,
      options: [
        {
          name: "query",
          description: "The song name to search for.",
          type: 3,
          required: true,
        },
      ],
    });
  }

  public async run(client: Bot, ctx: Context): Promise<any> {
    const query = ctx.args.join(" ");
    if (!query) {
      return ctx.sendMessage({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color.red)
            .setDescription("Please provide a song name to search."),
        ],
      });
    }

    let player = await client.manager.getPlayer(ctx.guild.id);
    const memberVoiceChannel = (ctx.member as any).voice.channel;

    if (!player) {
      player = await client.manager.createPlayer({
        guildId: ctx.guild?.id,
        voiceChannelId: memberVoiceChannel?.id,
        textChannelId: ctx.channel?.id,
        volume: 80,
        selfDeaf: true,
      });
    }

    if (!player?.connected) await player?.connect();

    const results = (await player.search(query, ctx.author)) as SearchResult;
    if (!results || !results.tracks.length) {
      return ctx.sendMessage({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color.red)
            .setDescription("No results found for your query."),
        ],
      });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select-track")
      .setPlaceholder("Select a track")
      .addOptions(
        results.tracks.slice(0, 10).map((track: Track, index: number) => {
          const rawTitle = `${index + 1}. ${track.info.title}`;
          const label =
            rawTitle.length > 100
              ? rawTitle.slice(0, 97).trim() + "..."
              : rawTitle;

          const description =
            track.info.author.length > 100
              ? track.info.author.slice(0, 97).trim() + "..."
              : track.info.author;

          return {
            label,
            description,
            value: index.toString(),
          };
        })
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectMenu
    );

    const embed = new EmbedBuilder()
      .setColor(client.color.main)
      .setAuthor({ name: "Search Results" })
      .setDescription(
        results.tracks
          .slice(0, 10)
          .map(
            (track: Track, index: number) =>
              `${index + 1}. [${track.info.title}](${track.info.uri}) - \`${
                track.info.author
              }\``
          )
          .join("\n")
      );

    const message = await ctx.sendMessage({
      embeds: [embed],
      components: [row],
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== ctx.author.id) {
        return interaction.reply({
          content: `${client.emoji.cross} Only the command author can use this select menu!`,
          flags: 64,
        });
      }

      await interaction.deferUpdate();
      const selectedIndex = parseInt(interaction.values[0]);
      const selectedTrack = results.tracks[selectedIndex];

      if (!selectedTrack) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.color.red)
              .setDescription("Invalid selection."),
          ],
        });
      }

      await player.queue.add(selectedTrack);

      if (!player.playing && player.queue.tracks.length > 0) {
        await player.play({ paused: false });
      }

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color.main)
            .setDescription(
              `Added [${selectedTrack.info.title}](${selectedTrack.info.uri}) to the queue.`
            ),
        ],
        components: [],
      });

      collector.stop();
    });

    collector.on("end", () => {
      message.edit({ components: [] }).catch(() => {});
    });
  }
}
