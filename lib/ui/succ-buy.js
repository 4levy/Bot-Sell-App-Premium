const { EmbedBuilder } = require("discord.js");

const succEmbed = (email) => {
  const embed = new EmbedBuilder()
    .setDescription(`\`\`\`✅ : OK! Check Email: ${email}\`\`\``)
    .setImage("https://singlecolorimage.com/get/00ff00/400x5")
    .setColor("#00ff00");

  return embed;
};

module.exports = succEmbed;
