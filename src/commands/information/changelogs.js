const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const config = require("@root/config.js");

module.exports = {
  name: "changelogs",
  description: "Displays the latest bot updates, new features, and upcoming changes.",
  cooldown: 5,
  isPremium: false,
  category: "INFORMATION",
  botPermissions: ["SendMessages", "EmbedLinks"],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["updates", "news"],
    usage: "/changelogs",
    minArgsCount: 0,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [],
  },

  messageRun: async (message) => {
    await simulateTyping(message.channel);
    const embeds = createChangelogEmbeds(config.STABLE_VERSION, message.client.user.displayAvatarURL());
    const row = createSupportRow();
    const navRow = createNavRow(embeds.length);

    let sentMsg = await message.channel.send({ embeds: [embeds[0]], components: [navRow, row] });
    if (embeds.length > 1) await changelogWaiter(sentMsg, embeds, row);
  },

  interactionRun: async (interaction) => {
    await simulateTyping(interaction.channel);
    const embeds = createChangelogEmbeds(config.STABLE_VERSION, interaction.client.user.displayAvatarURL());
    const row = createSupportRow();
    const navRow = createNavRow(embeds.length);

    let sentMsg;
    if (!interaction.replied && !interaction.deferred) {
      sentMsg = await interaction.reply({ embeds: [embeds[0]], components: [navRow, row], fetchReply: true });
    } else {
      sentMsg = await interaction.followUp({ embeds: [embeds[0]], ephemeral: true, components: [navRow, row], fetchReply: true });
    }
    if (embeds.length > 1) await changelogWaiter(sentMsg, embeds, row);
  },
};

function createChangelogEmbeds(version, botAvatar) {
  // Each section is a page for clarity and modern look
  const pages = [];

  // Page 1: Platform Support
  pages.push(
    new EmbedBuilder()
      .setTitle("📢 TACT Changelog")
      .setColor("#F59E0B")
      .setThumbnail(botAvatar)
      .setDescription([
        "Stay up to date with the latest features, improvements, and fixes.",
        "We’re always working to make your experience better!",
        "",
        "✨ **Latest Stable Release**",
        `> **Version:** \`${version}\``,
        "",
        "## 🚀 Platform Support",
        "• Linux",
        "• Windows",
        "• WSL"
      ].join("\n"))
      .setFooter({ text: "Page 1/5 • Platform Support" })
      .setTimestamp()
  );

  // Page 2: New Features
  pages.push(
    new EmbedBuilder()
      .setTitle("✨ New Features")
      .setColor("#22D3EE")
      .setThumbnail(botAvatar)
      .setDescription([
        "• **Bot Mention:** Get more info when mentioning the bot (e.g. `@bot-name#0001`).",
        "• **Bulk Moderation:**",
        "  - `/kick all` — Kick all non-admins (admin/bot owner only)",
        "  - `/ban all` — Ban all non-admins (admin/bot owner only)",
        "  - `/nick all` — Set nickname for all non-admins (admin/bot owner only)",
        "  - `/nick all reset` — Reset nicknames for all non-admins (admin/bot owner only)",
        "• **Image Category:** `/filter`, `/generator`, `/overlay` commands for image manipulation.",
        "• **Tiktok Info:** `/botinfo` now shows TikTok info.",
        "• **Help Menu Revamp:** Modern, cleaner help menu with a **Home** button for easy navigation.",
        "• **Presence Updater:** Improved presence updater for better status management.",
      ].join("\n\n"))
      .setFooter({ text: "Page 2/5 • New Features" })
      .setTimestamp()
  );

  // Page 3: Fixes
  pages.push(
    new EmbedBuilder()
      .setTitle("🛠️ Fixes")
      .setColor("#4ADE80")
      .setThumbnail(botAvatar)
      .setDescription("• General bug fixes and stability improvements.")
      .setFooter({ text: "Page 3/5 • Fixes" })
      .setTimestamp()
  );

  // Page 4: Changes
  pages.push(
    new EmbedBuilder()
      .setTitle("🔄 Changes")
      .setColor("#F472B6")
      .setThumbnail(botAvatar)
      .setDescription([
        "• Help menu UI/UX improvements.",
        "• Enhanced moderation command feedback and notifications.",
      ].join("\n\n"))
      .setFooter({ text: "Page 4/5 • Changes" })
      .setTimestamp()
  );

  // Page 5: Coming Soon
  pages.push(
    new EmbedBuilder()
      .setTitle("🔜 Coming Soon")
      .setColor("#FBBF24")
      .setThumbnail(botAvatar)
      .setDescription([
        "• **`/presence` Command (Bot Owner Only):** Manage bot activity/status (add, edit, remove, list).",
        "• **Mod Inbox via DMs:** Members can DM the bot for help, reports, or private moderation support.",
        "",
        "💡 **More updates, features, and improvements coming soon — stay tuned!**"
      ].join("\n\n"))
      .setFooter({ text: "Page 5/5 • Coming Soon" })
      .setTimestamp()
  );

  return pages;
}

function createSupportRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("🤖 Invite Me")
      .setStyle(ButtonStyle.Link)
      .setEmoji("➕")
      .setURL(config.INVITE_URL),
    new ButtonBuilder()
      .setLabel("🌐 Support Server")
      .setStyle(ButtonStyle.Link)
      .setEmoji("🛠️")
      .setURL("https://discord.gg/M7yyGfKdKx")
  );
}

function createNavRow(pageCount) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("changelog_prev")
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId("changelog_next")
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(pageCount <= 1)
  );
}

async function changelogWaiter(msg, embeds, supportRow) {
  let currentPage = 0;

  const collector = msg.channel.createMessageComponentCollector({
    filter: (i) =>
      ["changelog_prev", "changelog_next"].includes(i.customId) &&
      i.user.id === (msg.interaction?.user?.id || msg.author?.id),
    idle: 120 * 1000,
    time: 5 * 60 * 1000,
  });

  collector.on("collect", async (interaction) => {
    await interaction.deferUpdate();
    if (interaction.customId === "changelog_prev" && currentPage > 0) currentPage--;
    if (interaction.customId === "changelog_next" && currentPage < embeds.length - 1) currentPage++;

    // Update nav buttons
    const updatedNavRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("changelog_prev")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId("changelog_next")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === embeds.length - 1)
    );

    await msg.edit({ embeds: [embeds[currentPage]], components: [updatedNavRow, supportRow] });
  });

  collector.on("end", () => {
    if (msg.editable) msg.edit({ components: [supportRow] }).catch(() => {});
  });
}

async function simulateTyping(channel) {
  const delay = Math.floor(Math.random() * 1200) + 800;
  await channel.sendTyping();
  await new Promise((res) => setTimeout(res, delay));
}
