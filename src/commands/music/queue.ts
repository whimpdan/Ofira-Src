import { Command, type Context, type Bot } from "../../structures/index.js";
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export default class Queue extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "queue",
      description: {
        content: "Displays the current queue of songs.",
        examples: ["queue"],
        usage: "queue",
      },
      category: "Music",
      aliases: ["q"],
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
    const player = client.manager.players.get(ctx.guild.id);

    if (!player || !player.queue.tracks.length) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(`${client.emoji.cross} The queue is empty.`),
        ],
      });
    }

    const queue = player.queue.tracks;
    const totalPages = Math.ceil(queue.length / 10);
    let currentPage = 1;

    const generateQueueEmbed = (page: number) => {
      const start = (page - 1) * 10;
      const end = start + 10;
      const tracks = queue.slice(start, end);

      const embed = client
        .embed()
        .setColor(client.color.main)
        .setTitle("Current Queue")
        .setDescription(
          tracks
            .map(
              (track, index) =>
                `${start + index + 1}. [${track.info.title}](${
                  track.info.uri
                }) - \`${this.formatDuration(track.info.duration)}\``
            )
            .join("\n")
        )
        .setFooter({
          text: `Page ${page}/${totalPages} | ${queue.length} tracks`,
        });

      return embed;
    };

    const previousButton = new ButtonBuilder()
      .setCustomId("queue_previous")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 1);

    const nextButton = new ButtonBuilder()
      .setCustomId("queue_next")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === totalPages);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      previousButton,
      nextButton
    );

    const message = await ctx.sendMessage({
      embeds: [generateQueueEmbed(currentPage)],
      components: totalPages > 1 ? [row] : [],
    });

    if (totalPages > 1) {
      const collector = message.createMessageComponentCollector({
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.user.id !== ctx.author.id) {
          return interaction.reply({
            content: `${client.emoji.cross} Only the command author can use these buttons!`,
            flags: 64,
          });
        }

        if (interaction.customId === "queue_previous") {
          currentPage--;
        } else if (interaction.customId === "queue_next") {
          currentPage++;
        }

        previousButton.setDisabled(currentPage === 1);
        nextButton.setDisabled(currentPage === totalPages);

        await interaction.update({
          embeds: [generateQueueEmbed(currentPage)],
          components: [row],
        });
      });

      collector.on("end", () => {
        previousButton.setDisabled(true);
        nextButton.setDisabled(true);

        message.edit({
          components: [row],
        });
      });
    }
  }

  private formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  }
}
