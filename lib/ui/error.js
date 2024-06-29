const { EmbedBuilder } = require("discord.js");

const errorEmbed = (message) => {
  const embed = new EmbedBuilder()
    .setDescription(`\`\`\`❗ : ${message}\`\`\``)
    .setImage("https://singlecolorimage.com/get/ff0000/400x5")
    .setColor("#ff0000");

  return embed;
};

module.exports = errorEmbed;
