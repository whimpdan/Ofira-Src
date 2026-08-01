import { Command, type Context, type Bot } from "../../structures/index.js";
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ComponentType,
} from "discord.js";

export default class Help extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "help",
      description: {
        content: "Displays a list of available bot commands.",
        examples: ["help", "help ping"],
        usage: "help [command]",
      },
      category: "utility",
      aliases: ["commands", "h"],
      cooldown: 3,
      args: false,
      permissions: {
        dev: false,
        client: ["SendMessages", "EmbedLinks"],
        user: [],
      },
      slashCommand: true,
      options: [],
    });
  }

  public async run(client: Bot, ctx: Context, args: string[]): Promise<any> {
    const commands = client.commands.filter((cmd) => cmd.category !== "dev");
    const categories = [...new Set(commands.map((cmd) => cmd.category))];

    if (!args[0]) {
      const options = categories.map((category) => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        description: `Commands inside the ${category} category`,
        value: category,
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("help_menu")
        .setPlaceholder("Select a category")
        .addOptions(options);

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        selectMenu
      );

      const embed = new EmbedBuilder()
        .setColor(client.color.main)
        .setAuthor({
          name: `${client.user?.username} — Help Menu`,
          iconURL: client.user?.displayAvatarURL(),
        })
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(
          `View all available commands using the menu below.\nYou can also use \`${ctx.guild.prefix}help <command>\` for more details.`
        )
        .addFields([
          {
            name: "Categories",
            value: categories
              .map(
                (category) =>
                  `• ${category.charAt(0).toUpperCase() + category.slice(1)}`
              )
              .join("\n"),
          },
        ])
        .setFooter({
          text: `Total Commands: ${commands.size}`,
        });

      const replyMessage = await ctx.sendMessage({
        embeds: [embed],
        components: [row],
        fetchReply: true,
      });

      const collector = replyMessage.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId !== "help_menu") return;
        if (interaction.user.id !== ctx.author.id) {
          return interaction.reply({
            content: "You cannot use this menu.",
            flags: 64,
          });
        }

        const selectedCategory = interaction.values[0];
        const categoryCommands = client.commands.filter(
          (cmd) => cmd.category === selectedCategory
        );

        const categoryEmbed = new EmbedBuilder()
          .setColor(client.color.main)
          .setAuthor({
            name:
              selectedCategory.charAt(0).toUpperCase() +
              selectedCategory.slice(1),
          })
          .setDescription(
            categoryCommands.map((cmd) => `• \`${cmd.name}\``).join("\n")
          )
          .setFooter({
            text: `Category: ${selectedCategory}`,
          });

        await interaction.update({
          embeds: [categoryEmbed],
          components: [row],
        });
      });

      collector.on("end", async () => {
        await replyMessage.edit({
          components: [],
        });
      });

      return;
    }

    const command = client.commands.get(args[0].toLowerCase());
    if (!command) {
      return await ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(`Command \`${args[0]}\` not found.`),
        ],
      });
    }

    const commandEmbed = client
      .embed()
      .setColor(client.color.main)
      .setAuthor({
        name: `Command Help — ${command.name}`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(command.description.content)
      .addFields(
        {
          name: "Usage",
          value: `\`${ctx.guild.prefix}${command.description.usage}\``,
        },
        {
          name: "Examples",
          value: command.description.examples
            .map((example) => `\`${ctx.guild.prefix}${example}\``)
            .join("\n"),
        },
        {
          name: "Aliases",
          value: command.aliases.length
            ? command.aliases.map((alias) => `\`${alias}\``).join(", ")
            : "None",
        },
        {
          name: "Category",
          value: command.category,
        },
        {
          name: "Cooldown",
          value: `${command.cooldown} seconds`,
        },
        {
          name: "User Permissions Required",
          value: command.permissions.user.length
            ? command.permissions.user.map((perm) => `\`${perm}\``).join(", ")
            : "None",
        }
      );

    return await ctx.sendMessage({
      embeds: [commandEmbed],
    });
  }
}
