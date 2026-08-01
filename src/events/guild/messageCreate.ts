import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  type GuildMember,
  type Message,
  PermissionFlagsBits,
  WebhookClient,
  type TextChannel,
} from "discord.js";
import { Context, Event, type Bot } from "../../structures/index.js";
import prefixData from "../../db/prefix.js";
import noPrefix from "../../db/noPrefix.js";
import PremiumServer from "../../db/serverPremium.js";
import IgnoreChannel from "../../db/ignoreChannelSchema.js";

declare module "discord.js" {
  interface Guild {
    prefix?: string;
  }
}

export default class MessageCreate extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "messageCreate",
    });
  }

  public async run(message: Message<true>): Promise<any> {
    if (message.author.bot || !message.guild || !message.id) return;
    if (!message.inGuild()) return;
    const guild = message.guild;

    const data = await prefixData.findOne({ serverId: message.guild.id });
    const prefix = data?.prefix || this.client.config.prefix;

    const npData = await noPrefix.findOne({ userId: message.author.id });

    let botTag = `<@${this.client.user.id}>`;

    if (message.content.trim() === botTag) {
      const guildData = await IgnoreChannel.findOne({
        GuildId: message.guild.id,
      });
      if (guildData && guildData.IgnoredChannels.includes(message.channel.id)) {
        return await message.channel
          .send({
            embeds: [
              {
                description:
                  "This channel is ignored. Commands cannot be used here.",
                color: 0xff0000,
              },
            ],
          })
          .then((msg) => setTimeout(() => msg.delete(), 5000));
      }

      const requiredPerms = [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.EmbedLinks,
      ];

      const channelPerms = message.channel.permissionsFor(
        message.guild.members.me!
      );
      const missingPerms = requiredPerms.filter(
        (perm) => !channelPerms?.has(perm)
      );

      if (missingPerms.length > 0) {
        const permNames = missingPerms
          .map((perm) =>
            Object.keys(PermissionFlagsBits).find(
              (key) =>
                PermissionFlagsBits[key as keyof typeof PermissionFlagsBits] ===
                perm
            )
          )
          .join(", ");

        try {
          return await message.reply({
            content: `I'm missing the following permissions: **${permNames}**`,
          });
        } catch {
          return await message.author
            .send({
              content: `I'm missing permissions in \`${message.guild.name}\`: **${permNames}**\nChannel: <#${message.channelId}>`,
            })
            .catch(() => null);
        }
      }

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Invite Me")
          .setStyle(ButtonStyle.Link)
          .setURL(`${this.client.config.invite}`),
        new ButtonBuilder()
          .setLabel("Support Server")
          .setStyle(ButtonStyle.Link)
          .setURL(`${this.client.config.ssLink}`),
        new ButtonBuilder()
          .setLabel("Premium")
          .setStyle(ButtonStyle.Link)
          .setURL(`${this.client.config.pre}`)
      );
      const embed = this.client
        .embed()
        .setColor(this.client.color.main)
        .setAuthor({
          name: `Hey, I'm ${this.client.user.username}!`,
          iconURL: this.client.user.displayAvatarURL(),
        })
        .setDescription(
          `I'm here to help you with music and more — always ready when you tag me!\n\n` +
            `**Prefix:** \`${prefix}\`\n` +
            `Use **\`${prefix}help\`** to view all my commands.`
        )
        .addFields(
          {
            name: `About`,
            value: `A fast and high-quality music bot built for stability, clarity, and performance.`,
          },
          {
            name: `Server Settings`,
            value:
              `**Server ID:** ${message.guild.id}\n` +
              `**Current Prefix:** \`${prefix}\``,
          },
          {
            name: `💡 Quick Tips`,
            value:
              `• Use prefix commands or mention me.\n` +
              `• Type \`${prefix}play <song>\` to start playing music.\n` +
              `• Need help? Visit the support server.`,
          }
        )
        .setThumbnail(this.client.user.displayAvatarURL());

      return message.reply({ embeds: [embed], components: [row] });
    }

    const regex = new RegExp(`<@!?${this.client.user?.id}>`);
    const match = message.content.match(regex);
    const pre = match ? match[0] : prefix;

    message.guild.prefix = prefix;

    if (!npData && !message.content.startsWith(pre)) return;

    const args = !npData
      ? message.content.slice(pre.length).trim().split(/ +/)
      : message.content.startsWith(pre)
      ? message.content.slice(pre.length).trim().split(/ +/)
      : message.content.trim().split(/ +/);

    const cmd: any = args.shift()?.toLowerCase();
    const command =
      this.client.commands.get(cmd) ||
      this.client.commands.get(this.client.aliases.get(cmd) as string);
    if (!command) return;

    const ctx = new Context(message, args);
    ctx.setArgs(args);

    const requiredPerms = [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.EmbedLinks,
    ];

    const channelPerms = message.channel.permissionsFor(
      message.guild.members.me!
    );
    const missingPerms = requiredPerms.filter(
      (perm) => !channelPerms?.has(perm)
    );

    if (missingPerms.length > 0) {
      const permNames = missingPerms
        .map((perm) =>
          Object.keys(PermissionFlagsBits).find(
            (key) =>
              PermissionFlagsBits[key as keyof typeof PermissionFlagsBits] ===
              perm
          )
        )
        .join(", ");

      try {
        return await message.reply({
          content: `I'm missing the following permissions: **${permNames}**`,
        });
      } catch {
        return await message.author
          .send({
            content: `I'm missing permissions in \`${message.guild.name}\`: **${permNames}**\nChannel: <#${message.channelId}>`,
          })
          .catch(() => null);
      }
    }

    const guildData = await IgnoreChannel.findOne({
      GuildId: message.guild.id,
    });
    if (guildData && guildData.IgnoredChannels.includes(message.channel.id)) {
      return message.channel
        .send({
          embeds: [
            {
              description:
                "This channel is ignored. Commands cannot be used here.",
              color: 0xff0000,
            },
          ],
        })
        .then((msg) => setTimeout(() => msg.delete(), 5000));
    }

    if (command.permissions) {
      if (command.permissions.client) {
        if (
          !message.guild.members.me?.permissions.has(command.permissions.client)
        ) {
          return await message.reply({
            content: "I don't have enough permissions to execute this command.",
          });
        }
      }
      if (command.permissions.user) {
        if (!message.member?.permissions.has(command.permissions.user)) {
          return await message.reply({
            content: "You don't have enough permissions to use this command.",
          });
        }
      }
      if (command.permissions.dev) {
        if (this.client.config.owners) {
          const findDev = this.client.config.owners.find(
            (x) => x === message.author.id
          );
          if (!findDev) return;
        }
      }
    }

    if (command.check) {
      const member = ctx.member as GuildMember;
      const guild = ctx.guild;
      const player = this.client.manager.getPlayer(guild.id);
      if (command.check.inVc) {
        if (!member.voice.channel) {
          const embed = this.client
            .embed()
            .setColor(this.client.color.red)
            .setDescription(
              `${this.client.emoji.cross} You need to be in a voice channel to use this command.`
            );
          return ctx.sendMessage({ embeds: [embed] });
        }
      }

      if (command.check.player) {
        if (!player || !player.queue.current) {
          const embed = this.client
            .embed()
            .setColor(this.client.color.red)
            .setDescription(
              `${this.client.emoji.cross} There is no music currently playing.`
            );
          return ctx.sendMessage({ embeds: [embed] });
        }
      }

      if (command.check.sameVc) {
        const clientMember = message.guild.members.resolve(this.client.user!)!;
        if (
          clientMember.voice.channel &&
          clientMember.voice.channelId !== member.voice.channelId
        ) {
          const embed = this.client
            .embed()
            .setColor(this.client.color.red)
            .setDescription(
              `${this.client.emoji.cross} You need to be in the same voice channel as the bot.`
            );
          return ctx.sendMessage({ embeds: [embed] });
        }
      }
      if (command.check.connect) {
        const botPermissions = member.voice.channel.permissionsFor(
          ctx.guild.members.me!
        );
        if (
          !botPermissions?.has("Connect") ||
          !botPermissions?.has("Speak") ||
          !botPermissions?.has("ViewChannel")
        ) {
          return ctx.sendMessage({
            embeds: [
              this.client
                .embed()
                .setColor(this.client.color.red)
                .setDescription(
                  `${this.client.emoji.cross} I don't have permission to join or speak in **${member.voice.channel.name}**.`
                ),
            ],
          });
        }
      }
    }

    if (command.premium && this.client.config.premium) {
      const premiumData = await PremiumServer.findOne({
        guildId: message.guild?.id,
      });
      if (!premiumData) {
        const embed = this.client
          .embed()
          .setDescription("This server does not have premium enabled.")
          .setColor(this.client.color.main);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Get Premium")
            .setURL(`${this.client.config.pre}`)
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel("Support Server")
            .setURL(this.client.config.ssLink)
            .setStyle(ButtonStyle.Link)
        );
        return await message.reply({ embeds: [embed], components: [row] });
      }
    }

    if (command.args && !args.length) {
      const embed = this.client
        .embed()
        .setColor(this.client.color.red)
        .setTitle("Missing Arguments")
        .setDescription(
          `Please provide the required arguments for the \`${
            command.name
          }\` command.\n\nExamples:\n${
            command.description.examples
              ? command.description.examples.join("\n")
              : "None"
          }`
        )
        .setFooter({ text: "Syntax: [] = optional, <> = required" });
      return await message.reply({ embeds: [embed] });
    }

    if (!this.client.cooldown.has(cmd)) {
      this.client.cooldown.set(cmd, new Collection());
    }

    const now = Date.now();
    const timestamps = this.client.cooldown.get(cmd);
    const cooldownAmount = (command.cooldown || 5) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime =
        timestamps.get(message.author.id)! + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        if (!timestamps.get(`${message.author.id}-notified`)) {
          timestamps.set(`${message.author.id}-notified`, true);
          setTimeout(
            () => timestamps.delete(`${message.author.id}-notified`),
            cooldownAmount
          );
          return await message.reply({
            content: `Please wait ${timeLeft.toFixed(
              1
            )} more second(s) before reusing the \`${cmd}\` command.`,
          });
        }
        return;
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    if (args.includes("@everyone") || args.includes("@here")) {
      return await message.reply({
        content: "You can't use this command with everyone or here.",
      });
    }

    try {
      const cname = message.channel as TextChannel;
      const commandlogs = new WebhookClient({
        url: `${this.client.config.cmd_log}`,
      });
      commandlogs.send({
        embeds: [
          this.client
            .embed()
            .setTitle(`Message Command Logs`)
            .setColor(this.client.color.main)
            .setAuthor({
              name: `${this.client.user?.username}`,
              iconURL: this.client.user?.displayAvatarURL(),
            })
            .addFields([
              {
                name: `Information`,
                value: `Command Author: ${message.author.tag}\nCommand Name: \`${command.name}\`\nChannel Id: ${message.channel.id}\nChannel Name: ${cname.name}\nGuild Name: ${message.guild.name}\nGuild Id: ${message.guild.id}`,
              },
            ])
            .setThumbnail(message.guild.iconURL()!),
        ],
      });
      return await command.run(this.client, ctx, ctx.args);
    } catch (error) {
      console.error(error);
    }
  }
}
