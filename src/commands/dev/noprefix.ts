import { Command, type Context, type Bot } from "../../structures/index.js";
import noPrefix from "../../db/noPrefix.js";
import pkg from "lodash";

import {
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

export default class Nopre extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "nopre",
      description: {
        content: "",
        examples: [""],
        usage: "",
      },
      category: "dev",
      aliases: ["noprefix"],
      cooldown: 3,
      args: false,

      permissions: {
        dev: true,
        client: [
          "SendMessages",
          "ReadMessageHistory",
          "ViewChannel",
          "EmbedLinks",
        ],
        user: [],
      },
      slashCommand: false,
      options: [],
    });
  }

  public async run(client: Bot, ctx: Context, args: string[]): Promise<any> {
    try {
      const { chunk } = pkg;
      const prefix = ",";

      const sub = args[0]?.toLowerCase();

      const mention = ctx.message?.mentions?.users?.first() || null;
      let userId: string | null = mention ? mention.id : args[1] || null;

      const needsUser = ["add", "remove"].includes(sub || "");

      if (!sub) {
        const embed = client
          .embed()
          .setColor(client.color.main)
          .setDescription(`Use ${prefix}noprefix add/remove/list`);
        return ctx.sendMessage({ embeds: [embed] });
      }

      if (needsUser) {
        if (!userId) {
          const embed = client
            .embed()
            .setColor(client.color.main)
            .setDescription("You must provide a user mention or user ID.");
          return ctx.sendMessage({ embeds: [embed] });
        }

        if (!mention) {
          if (isNaN(Number(userId))) {
            const embed = client
              .embed()
              .setColor(client.color.main)
              .setDescription("Invalid user ID.");
            return ctx.sendMessage({ embeds: [embed] });
          }

          try {
            const fetched = await client.users.fetch(userId);
            userId = fetched.id;
          } catch {
            const embed = client
              .embed()
              .setColor(client.color.main)
              .setDescription("This user does not exist.");
            return ctx.sendMessage({ embeds: [embed] });
          }
        }
      }

      const data = userId ? await noPrefix.findOne({ userId }) : null;

      if (sub === "add") {
        if (data) {
          const embed = client
            .embed()
            .setColor(client.color.main)
            .setDescription("User already has NoPrefix.");
          return ctx.sendMessage({ embeds: [embed] });
        }

        const select = new StringSelectMenuBuilder()
          .setCustomId("nopre_duration_select")
          .setPlaceholder("Select NoPrefix duration")
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("1 Day")
              .setValue("day_1"),
            new StringSelectMenuOptionBuilder()
              .setLabel("3 Days")
              .setValue("day_3"),
            new StringSelectMenuOptionBuilder()
              .setLabel("7 Days")
              .setValue("day_7"),
            new StringSelectMenuOptionBuilder()
              .setLabel("15 Days")
              .setValue("day_15"),
            new StringSelectMenuOptionBuilder()
              .setLabel("30 Days")
              .setValue("day_30"),
            new StringSelectMenuOptionBuilder()
              .setLabel("60 Days")
              .setValue("day_60"),
            new StringSelectMenuOptionBuilder()
              .setLabel("90 Days")
              .setValue("day_90"),
            new StringSelectMenuOptionBuilder()
              .setLabel("Lifetime")
              .setValue("lifetime")
          );

        const row =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

        const embed = client
          .embed()
          .setColor(client.color.main)
          .setDescription(`Select NoPrefix duration for <@${userId}>`);

        const msg = await ctx.sendMessage({
          embeds: [embed],
          components: [row],
        });

        const validIds = ["nopre_duration_select"];

        const collector = msg.createMessageComponentCollector({
          filter: (i) => validIds.includes(i.customId),
          time: 2 * 60 * 1000,
        });

        collector.on("collect", async (interaction) => {
          if (interaction.user.id !== ctx.author.id) {
            return interaction.reply({
              content: "You are not allowed to use this.",
              flags: 64,
            });
          }

          if (!interaction.isStringSelectMenu()) return;

          const value = interaction.values[0];
          let expiresAt: Date | null = null;
          let lifetime = false;

          const now = Date.now();

          if (value.startsWith("day_")) {
            const days = Number(value.split("_")[1]);
            expiresAt = new Date(now + days * 86400000);
          }

          if (value === "lifetime") {
            lifetime = true;
            expiresAt = null;
          }

          await noPrefix.create({
            userId,
            expiresAt,
            lifetime,
          });

          const doneEmbed = client
            .embed()
            .setColor(client.color.main)
            .setDescription(
              lifetime
                ? `<@${userId}> now has **Lifetime NoPrefix**`
                : `<@${userId}> now has NoPrefix for **${
                    value.split("_")[1]
                  } days**`
            );

          await interaction.update({ embeds: [doneEmbed], components: [] });
        });

        return;
      }

      if (sub === "remove") {
        if (!data) {
          const embed = client
            .embed()
            .setColor(client.color.main)
            .setDescription("This user doesn't have NoPrefix.");
          return ctx.sendMessage({ embeds: [embed] });
        }

        await noPrefix.findOneAndDelete({ userId });

        const embed = client
          .embed()
          .setColor(client.color.main)
          .setDescription(`Removed NoPrefix from <@${userId}>.`);
        return ctx.sendMessage({ embeds: [embed] });
      }

      if (sub === "list" || sub === "show") {
        let dataList = await noPrefix.find();

        const users = await Promise.all(
          dataList.map(async (entry, index) => {
            try {
              const user = await client.users.fetch(entry.userId);
              return `[${index + 1}]. [${
                user.globalName
              }](https://discord.com/users/${user.id}) ${
                entry.lifetime
                  ? "(Lifetime)"
                  : entry.expiresAt
                  ? `(Expires <t:${Math.floor(
                      entry.expiresAt.getTime() / 1000
                    )}:R>)`
                  : ""
              }`;
            } catch {
              return null;
            }
          })
        );

        const validUsers = users.filter((u) => u !== null);

        if (validUsers.length < 11) {
          let embed = client
            .embed()
            .setColor(client.color.main)
            .setTitle("NoPrefix List")
            .setDescription(
              validUsers.length ? validUsers.join("\n") : "No User Yet"
            );
          return ctx.sendMessage({ embeds: [embed] });
        }

        let queue = validUsers.map((x) => `${x}`);
        let maps = chunk(queue, 10);
        let pages = maps.map((x) => x.join("\n"));
        let page = 0;

        const embed = client
          .embed()
          .setTitle("NoPrefix List")
          .setDescription(pages[page])
          .setColor(client.color.main);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("nopre_prev")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("nopre_stop")
            .setLabel("Stop")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("nopre_next")
            .setLabel("Next")
            .setStyle(ButtonStyle.Secondary)
        );

        let msg = await ctx.sendMessage({ embeds: [embed], components: [row] });

        const validIds = ["nopre_prev", "nopre_next", "nopre_stop"];

        const collector = msg.createMessageComponentCollector({
          filter: (i) => validIds.includes(i.customId),
          time: 5 * 60 * 1000,
        });

        collector.on("collect", async (interaction) => {
          if (interaction.user.id !== ctx.author.id) {
            return interaction.reply({
              content: "You are not allowed to use this.",
              flags: 64,
            });
          }

          if (interaction.customId === "nopre_prev") {
            page = page > 0 ? --page : pages.length - 1;
          }

          if (interaction.customId === "nopre_next") {
            page = page + 1 < pages.length ? ++page : 0;
          }

          if (interaction.customId === "nopre_stop") {
            collector.stop();
            return;
          }

          await interaction.update({
            embeds: [
              client
                .embed()
                .setTitle("NoPrefix List")
                .setColor(client.color.main)
                .setDescription(pages[page]),
            ],
          });
        });

        collector.on("end", async () => {
          const disabledRow =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId("nopre_prev")
                .setLabel("Previous")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId("nopre_stop")
                .setLabel("Stop")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId("nopre_next")
                .setLabel("Next")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
            );

          await msg.edit({ components: [disabledRow] });
        });

        return;
      }
    } catch (e) {
      console.log(e);
    }
  }
}
