const { EmbedBuilder } = require("discord.js");

const appEmbed = (appLength) => {
  const embed = new EmbedBuilder()
    .setDescription(
      `\`\`\`🛒 เลือกสินค้าด้านล่าง ( มีทั้งหมด ${appLength} แอพ )\`\`\``
    )
    .setImage("https://singlecolorimage.com/get/5143e2/400x5")
    .setColor("#5143e2");

  return embed;
};

module.exports = appEmbed;
