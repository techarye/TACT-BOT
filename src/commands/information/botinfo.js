const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "botinfo",
  description: "Displays information about the bot.",
  cooldown: 5,
  isPremium: false,
  category: "INFORMATION",
  botPermissions: ["SendMessages", "EmbedLinks"],
  userPermissions: [],
  validations: [],
  command: {
    enabled: true,
    aliases: ["info", "aboutbot"],
    usage: "*botinfo",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [],
  },

  messageRun: async (message) => {
    const embed = new EmbedBuilder()
      .setTitle("🤖 Bot Information")
      .setDescription("Here is some information about the bot.")
      .setColor("#5865F2")
      .addFields(
        {
          name: "👤 Developer",
          value: "[techarye](https://github.com/techarye)",
          inline: true,
        },
        {
          name: "📚 GitHub Repo",
          value: "[TACT-BOT](https://github.com/techarye/TACT-BOT)",
          inline: true,
        },
        {
          name: "🌍 Hosting",
          value: "[bot-hosting.net](http://bot-hosting.net/)",
          inline: true,
        }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("🤖 Bot Information")
      .setDescription("Here is some information about the bot.")
      .setColor("#5865F2")
      .addFields(
        {
          name: "👤 Developer",
          value: "[techarye](https://github.com/techarye)",
          inline: true,
        },
        {
          name: "📚 GitHub Repo",
          value: "[TACT-BOT](https://github.com/techarye/TACT-BOT)",
          inline: true,
        },
        {
          name: "🌍 Hosting",
          value: "[bot-hosting.net](http://bot-hosting.net/)",
          inline: true,
        }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    // Avoid replying twice
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  },
};
