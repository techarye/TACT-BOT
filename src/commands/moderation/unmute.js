const { unmuteTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "unmute",
  description: "remove mute from a member",
  category: "MODERATION",
  botPermissions: ["ModerateMembers"],
  userPermissions: ["ModerateMembers"],
  command: {
    enabled: true,
    aliases: ["untimeout"],
    usage: "<ID|@member> [reason]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "the target member",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "reason",
        description: "reason for mute",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`No user found matching ${args[0]}`);
    const reason = args.slice(1).join(" ").trim();
    const response = await unmute(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await unmute(interaction.member, target, reason);
    await interaction.followUp(response);
  },
};

async function unmute(issuer, target, reason) {
  const response = await unmuteTarget(issuer, target, reason);
  if (typeof response === "boolean") return `Mute of ${target.user.username} is removed!`;
  if (response === "BOT_PERM") return `I do not have permission to remove mute of ${target.user.username}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to remove mute of ${target.user.username}`;
  else if (response === "NO_mute") return `${target.user.username} is not muted!`;
  else return `Failed to remove mute of ${target.user.username}`;
}
