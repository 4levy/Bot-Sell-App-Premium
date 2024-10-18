const Discord = require("discord.js");
const axios = require("axios");
const { BYShop } = require("./lib/api/byshop");
const { UserManager } = require("./lib/api/usermanager");
const config = require("./setup/config.json");
const starter = require("./setup/starter");

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

const byshop = new BYShop({ key: starter.key });
const manager = new UserManager();

const percent = (base, percentage, operation) => {
  let result = (base * percentage) / 100;
  if (operation === "add") {
    return Math.ceil(base + result);
  }
  if (operation === "subtract") {
    return Math.ceil(base - result);
  }
  throw Error("Invalid operation. Use 'add' or 'subtract'.");
};

client.on("ready", () => {
  console.clear();
  console.log("BOT - DEMO 0.0.3");
  console.log("------------------------------------------------------------");
  console.log(
    "🟢 ONLINE - " + client.user.tag + " |  PREFIX - " + config.prefix
  );
  console.log("------------------------------------------------------------");

  const commands = [
    { name: "setup", description: "ติดตั้งบอทขายแอพพรีเมี่ยม (Admin Only)" },
    { name: "check (userid)", description: "เช็คเงินสมาชิก (Admin Only)" },
    {
      name: "add (userid) (amount)",
      description: "เติมเงินให้สมาชิก (Admin Only)",
    },
    {
      name: "subtract (userid) (amount)",
      description: "ลบเงินสมาชิก (Admin Only)",
    },
  ];

  commands.forEach((command) => {
    console.log(`📝 ${config.prefix}${command.name} - ${command.description}`);
  });

  console.log("------------------------------------------------------------");
});

client.on("messageCreate", async (message) => {
  if (
    !message.content.startsWith(config.prefix) ||
    message.author.bot ||
    !config.admin.includes(message.author.id)
  ) {
    return;
  }

  const args = message.content.slice(config.prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();

  if (command === "setup") {
    message.delete(message.content);

    const actionRow = new Discord.ActionRowBuilder().addComponents(
      new Discord.StringSelectMenuBuilder()
        .setCustomId("choice")
        .setPlaceholder("[ 🛒 เลือกทำรายการที่นี่ ]")
        .addOptions([
          {
            emoji: "🛒",
            label: "ซื้อแอพพรีเมี่ยม",
            description: "แสดงแอพพรีเมี่ยมทั้งหมด",
            value: "getapps",
          },
          {
            emoji: "1226500645792649287",
            label: "Reset",
            description: "รีเซ็ตตัวเลือก",
            value: "reset",
          },
        ])
    );

    const buttonRow = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setEmoji("💸")
        .setLabel("เติมเงิน")
        .setCustomId("topupmoney")
        .setStyle(Discord.ButtonStyle.Success),
      new Discord.ButtonBuilder()
        .setEmoji("💰")
        .setLabel("เช็คเงิน")
        .setCustomId("checkmoney")
        .setStyle(Discord.ButtonStyle.Secondary)
    );

    const embed = require("./lib/ui/setup");
    embed.setFooter({
      text: "BOT - ซื้อแอพพรีเมี่ยม | Powered By LOYBUNG ALL",
      iconURL: "https://img5.pic.in.th/file/secure-sv1/20230513_185755.png",
    });

    message.channel.send({
      embeds: [embed],
      components: [actionRow, buttonRow],
    });
  }

  if (command === "check") {
    const waitingMessage = await message.reply({ content: "รอสักครู่" });

    try {
      await message.guild.members.fetch().catch(() => {});
      const member = message.guild.members.cache.get(args[0]);
      if (!member) {
        throw Error("userid ไม่ถูกต้อง");
      }
      const data = await manager.get(member.user.id);
      waitingMessage.edit("มี " + data.data.balance + " บาท");
    } catch (error) {
      waitingMessage.edit(error.message);
    }
  }

  if (command === "add") {
    const waitingMessage = await message.reply({ content: "รอสักครู่" });

    try {
      await message.guild.members.fetch().catch(() => {});
      const member = message.guild.members.cache.get(args[0]);
      if (!member) {
        throw Error("userid ไม่ถูกต้อง");
      }
      const amount = args[1];
      const response = await manager.topup(
        member.user.id,
        member.user.username,
        Number(amount)
      );
      if (!response.success) {
        throw Error(response.message);
      }
      waitingMessage.edit(response.message);
    } catch (error) {
      waitingMessage.edit(error.message);
    }
  }

  if (command === "subtract") {
    const waitingMessage = await message.reply({ content: "รอสักครู่" });

    try {
      await message.guild.members.fetch().catch(() => {});
      const member = message.guild.members.cache.get(args[0]);
      if (!member) {
        throw Error("userid ไม่ถูกต้อง");
      }
      const amount = args[1];
      const response = await manager.pay(member.user.id, Number(amount));
      if (!response.success) {
        throw Error(response.message);
      }
      waitingMessage.edit("ลบเงินสำเร็จ");
    } catch (error) {
      waitingMessage.edit(error.message);
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.customId === "choice") {
    const choice = interaction.values.join();
    await interaction.deferReply({ ephemeral: true });

    if (choice === "reset") {
      interaction.deleteReply();
    }

    if (choice === "getapps") {
      try {
        const {
          ActionRowBuilder,
          StringSelectMenuBuilder,
          StringSelectMenuOptionBuilder,
        } = Discord;
        const apps = await byshop.getApps();
        apps.products.shift();

        const options = apps.products.map((product) => {
          const availableCount = product.products.filter(
            (p) => p.emoji === "🟢"
          ).length;
          const status =
            availableCount > 0
              ? `🟢 พร้อมส่ง ${availableCount} รายการ`
              : "🔴 สินค้าหมด";
          const description = `🛒 มีตัวเลือก ${product.products.length} รายการ | ${status}`;
          return new StringSelectMenuOptionBuilder()
            .setEmoji(product.emoji)
            .setLabel(product.name)
            .setDescription(description)
            .setValue(product.name);
        });

        const actionRow = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("detailapps")
            .addOptions(options)
        );

        const embed = require("./lib/ui/product")(apps.products.length);
        interaction.editReply({ embeds: [embed], components: [actionRow] });
      } catch (error) {
        const errorEmbed = require("./lib/ui/error")(error.message);
        interaction.editReply({ embeds: [errorEmbed] });
      }
    }
  }

  if (interaction.customId === "detailapps") {
    const selectedAppName = interaction.values.join();
    await interaction.deferReply({ ephemeral: true });

    try {
      const {
        ActionRowBuilder,
        StringSelectMenuBuilder,
        StringSelectMenuOptionBuilder,
      } = Discord;
      const apps = await byshop.getApps();
      const selectedApp = apps.products.find(
        (app) => app.name === selectedAppName
      );
      const products = selectedApp.products;

      const options = products.map((product) => {
        const priceWithMargin = percent(product.price, config.price, "add");
        const description = `${product.emoji} | ราคา ${priceWithMargin} บาท สต๊อก ${product.stock} ชิ้น ( ${product.status} )`;
        return new StringSelectMenuOptionBuilder()
          .setEmoji(selectedApp.emoji)
          .setLabel(product.name)
          .setDescription(description)
          .setValue(product.id);
      });

      const actionRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId("buy").addOptions(options)
      );

      const embed = require("./lib/ui/appdetail")(
        selectedApp.name,
        products.length
      );
      interaction.editReply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
      const errorEmbed = require("./lib/ui/error")(error.message);
      interaction.editReply({ embeds: [errorEmbed] });
    }
  }

  if (interaction.customId === "buy") {
    const productId = interaction.values.join();
    const { ModalBuilder, TextInputBuilder, TextInputStyle } = Discord;

    const modal = new ModalBuilder({
      custom_id: "buy-confirm:" + productId,
      title: "Email",
    });

    const textInput = new TextInputBuilder({
      custom_id: "email",
      label: "กรุณากรอก Email ของท่าน เพื่อรับรหัส",
      style: TextInputStyle.Short,
      placeholder: "หากใส่ผิดแอดมินไม่รับผิดชอบ",
      required: true,
    });

    const actionRow = new ActionRowBuilder().addComponents(textInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  }

  if (interaction.customId.includes("buy-confirm")) {
    const productId = interaction.customId.split(":")[1];
    const email = interaction.fields.getTextInputValue("email");
    await interaction.deferReply({ ephemeral: true });

    try {
      const apps = await byshop.getApps();
      const selectedApp = apps.products.find((app) =>
        app.products.find((product) => product.id === productId)
      );
      const selectedProduct = selectedApp.products.find(
        (product) => product.id === productId
      );
      const priceWithMargin = percent(
        selectedProduct.price,
        config.price,
        "add"
      );

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw Error("รูปแบบ Email ไม่ถูกต้อง");
      }

      const userData = await manager.get(interaction.user.id);
      if (!userData.success || userData.data.balance < priceWithMargin) {
        throw Error("เงินของคุณไม่พอ");
      }

      const shopData = await byshop.login();
      if (shopData.balance < selectedProduct.price) {
        throw Error("โปรดติดต่อผู้ให้บริการ (E1010x1)");
      }

      await byshop.buy(productId, interaction.user.id, email);
      await manager.pay(interaction.user.id, priceWithMargin);

      const successEmbed = require("./lib/ui/succ-buy")(email);
      interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      const errorEmbed = require("./lib/ui/error")(error.message);
      interaction.editReply({ embeds: [errorEmbed] });
    }
  }

  if (interaction.customId === "topupmoney") {
    await interaction.deferReply({ ephemeral: true });

    const topupOptions = [
      {
        emoji: "1245970422512746546",
        label: "TrueMoney Wallet",
        description: "🟢 | ซองทรูมันนี่",
        value: "tw-gift",
      },
      {
        emoji: "1226500645792649287",
        label: "Reset",
        description: "รีเซ็ตตัวเลือก",
        value: "reset",
      },
    ];

    const actionRow = new Discord.ActionRowBuilder().addComponents(
      new Discord.StringSelectMenuBuilder()
        .setCustomId("topup")
        .addOptions(
          topupOptions.map((option) =>
            new Discord.StringSelectMenuOptionBuilder()
              .setEmoji(option.emoji)
              .setLabel(option.label)
              .setDescription(option.description)
              .setValue(option.value)
          )
        )
    );

    interaction.editReply({ embeds: [], components: [actionRow] });
  }

  if (interaction.customId === "checkmoney") {
    await interaction.deferReply({ ephemeral: true });

    try {
      const userData = await manager.get(interaction.user.id);
      if (!userData.success) {
        throw Error("เติมเงินเพื่อเปิดบัญชี");
      }

      const successEmbed = require("./lib/ui/succ")(
        "💰 : ยอดคงเหลือ " + userData.data.balance + " บาท"
      );
      interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      const errorEmbed = require("./lib/ui/error")(error.message);
      interaction.editReply({ embeds: [errorEmbed] });
    }
  }

  if (interaction.customId === "topup") {
    const selectedValue = interaction.values.join();

    if (selectedValue === "reset") {
      await interaction.deferReply({ ephemeral: true });
      interaction.deleteReply();
    }

    if (selectedValue === "tw-gift") {
      const modal = new Discord.ModalBuilder({
        custom_id: "tw-topup",
        title: "TrueMoney Wallet",
      });

      const textInput = new Discord.TextInputBuilder({
        custom_id: "link",
        label: "ลิงก์ซอง",
        style: Discord.TextInputStyle.Short,
        placeholder:
          "https://gift.truemoney.com/campaign/?v=XXXXXXXXXXXXXXXXXXXXXX",
        required: true,
      });

      const actionRow = new Discord.ActionRowBuilder().addComponents(textInput);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);

      const modalSubmitInteraction = await interaction.awaitModalSubmit({
        filter: (i) => i.customId === "tw-topup",
        time: 60000,
      });

      try {
        await modalSubmitInteraction.deferReply({ ephemeral: true });

        const link = modalSubmitInteraction.fields.getTextInputValue("link");

        const response = await axios
          .post("https://loybung.vercel.app/api/truemoney_gift", {
            phone: config.payments.truemoney,
            link: link,
          })
          .catch((error) => ({ data: error.response.data }));

        if (!response.data.success) {
          throw Error(response.data.message);
        }

        await manager.topup(
          modalSubmitInteraction.user.id,
          modalSubmitInteraction.user.username,
          response.data.amount.integer
        );

        const successEmbed = require("./lib/ui/succ-topup")(
          response.data.amount.integer
        );
        modalSubmitInteraction.editReply({ embeds: [successEmbed] });
      } catch (error) {
        const errorEmbed = require("./lib/ui/error")(error.message);
        modalSubmitInteraction.editReply({ embeds: [errorEmbed] });
      }
    }
  }
});

client.login(starter.token);
