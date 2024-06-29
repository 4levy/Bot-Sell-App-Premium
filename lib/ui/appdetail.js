const { EmbedBuilder } = require("discord.js");

const appEmbed = (appname, list) => {
  const embed = new EmbedBuilder()
    .setDescription(`\`\`\`🛒 ${appname} ( มีทั้งหมด ${list} รายการ )\`\`\``)
    .setImage("https://singlecolorimage.com/get/5143e2/400x5")
    .setColor("#5143e2");

  return embed;
};

module.exports = appEmbed;
