const { ApplicationCommandOptionType } = require("discord.js");
const getTogetherInvite = require("./functions/together/getTogetherInvite");

const discordTogether = [
  "askaway",
  "awkword",
  "betrayal",
  "bobble",
  "checkers",
  "chess",
  "chessdev",
  "doodlecrew",
  "fishing",
  "land",
  "lettertile",
  "meme",
  "ocho",
  "poker",
  "puttparty",
  "puttpartyqa",
  "sketchheads",
  "sketchyartist",
  "spellcast",
  "wordsnack",
  "youtube",
  "youtubedev",
];

module.exports = {
  name: "together",
  description: "discord together",
  category: "FUN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    aliases: ["discordtogether"],
    usage: "<game>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "type",
        description: "type",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: discordTogether.map((game) => ({ name: game, value: game })),
      },
    ],
  },

  async messageRun(message, args) {
    const input = args[0];
    const response = await getTogetherInvite(message.member, input);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("type");
    const response = await getTogetherInvite(interaction.member, choice);
    await interaction.followUp(response);
  },
};
