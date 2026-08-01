import { Command, type Context, type Bot } from "../../structures/index.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";

export default class Loop extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "loop",
      description: {
        content:
          "Toggles looping for the current track or queue using buttons.",
        examples: ["loop"],
        usage: "loop",
      },
      category: "Music",
      aliases: ["repeat"],
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
    });
  }

  public async run(client: Bot, ctx: Context): Promise<any> {
    const player = client.manager.getPlayer(ctx.guild.id);

    const loopModes = {
      track: `Looping **current track** ${client.emoji.loop1}`,
      queue: `Looping **queue** ${client.emoji.loop}`,
      off: "Loop **disabled**",
    };

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("loop_track")
        .setLabel("Current Song")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("loop_queue")
        .setLabel("Queue")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("loop_off")
        .setLabel("Off")
        .setStyle(ButtonStyle.Danger)
    );

    const msg = await ctx.sendMessage({
      embeds: [
        client
          .embed()
          .setColor(client.color.main)
          .setDescription(
            `Current loop mode: ${loopModes[player.repeatMode] || "off"}`
          ),
      ],
      components: [buttons],
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== ctx.author.id) {
        return interaction.reply({
          content: "You cannot use these buttons.",
          flags: 64,
        });
      }

      let mode: "track" | "queue" | "off" = "off";
      switch (interaction.customId) {
        case "loop_track":
          mode = "track";
          break;
        case "loop_queue":
          mode = "queue";
          break;
        case "loop_off":
          mode = "off";
          break;
      }

      await player.setRepeatMode(mode);

      await interaction.update({
        embeds: [
          client
            .embed()
            .setColor(client.color.main)
            .setDescription(
              `${client.emoji.tick} **Updated Loop Mode:** ${loopModes[mode]}`
            ),
        ],
        components: [],
      });

      collector.stop();
    });

    collector.on("end", async () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
}
