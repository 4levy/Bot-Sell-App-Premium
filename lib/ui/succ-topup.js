const { EmbedBuilder } = require("discord.js");

const succEmbed = (amount) => {
  const embed = new EmbedBuilder()
    .setDescription(`\`\`\`✅ : เติมเงินสำเร็จ ${amount} บาท\`\`\``)
    .setImage("https://singlecolorimage.com/get/00ff00/400x5")
    .setColor("#00ff00");

  return embed;
};

module.exports = succEmbed;
