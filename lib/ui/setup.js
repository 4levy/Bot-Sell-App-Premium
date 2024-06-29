const { EmbedBuilder } = require("discord.js");

const embed = new EmbedBuilder()
  .setAuthor({
    name: "บอทซื้อแอพพรีเมี่ยม อัตโนมัติ",
  })
  .setDescription(
    "```\n✅ ระบบอัตโนมัติ\n✅ ใช้งานง่าย\n```\n# 🛒 เลือกสินค้าด้านล่างได้เลย"
  )
  .setImage("https://singlecolorimage.com/get/5143e2/400x5")
  .setColor("#5143e2");

module.exports = embed;
