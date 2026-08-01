import {
    ActionRowBuilder,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ComponentType,
    type Message,
  } from "discord.js";
  import { Command, type Context, type Bot } from "../../structures/index.js";
  
  export default class Deploy extends Command {
    constructor(client: Bot) {
      super(client, {
        name: "deploy",
        description: {
          content: "Deploy commands",
          examples: ["deploy"],
          usage: "deploy",
        },
        category: "dev",
        aliases: ["deploy-commands"],
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
  
    public async run(client: Bot, ctx: Context, _args: string[]): Promise<any> {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("deploy-global")
          .setLabel("Global")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("deploy-guild")
          .setLabel("Guild")
          .setStyle(ButtonStyle.Secondary)
      );
  
      let msg: Message | undefined;
      try {
        msg = await ctx.sendMessage({
          content: "Where do you want to deploy the commands?",
          components: [row],
        });
      } catch (error) {
        console.error("Failed to send the initial message:", error);
        return;
      }
  
      const filter = (interaction: ButtonInteraction<"cached">) => {
        if (interaction.user.id !== ctx.author.id) {
          interaction
            .reply({
              content: "You can't interact with this message",
              flags: 64,
            })
            .catch(console.error);
          return false;
        }
        return true;
      };
  
      const collector = ctx.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 30000,
      });
  
      collector.on("collect", async (interaction) => {
        try {
          if (interaction.customId === "deploy-global") {
            await client.deployCommands();
            await ctx.editMessage({
              content: "Commands deployed globally.",
              components: [],
            });
          } else if (interaction.customId === "deploy-guild") {
            await client.deployCommands(interaction.guild!.id);
            await ctx.editMessage({
              content: "Commands deployed in this guild.",
              components: [],
            });
          }
        } catch (error) {
          console.error("Failed to handle interaction:", error);
        }
      });
  
      collector.on("end", async (_collected, reason) => {
        if (reason === "time" && msg) {
          try {
            await msg.delete();
          } catch (error) {
            console.error("Failed to delete the message:", error);
          }
        }
      });
    }
  }