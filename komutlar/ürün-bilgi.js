const { MessageButton } = require("discord.js");
const { MessageActionRow } = require("discord.js");
const { MessageEmbed, Client, CommandInteraction } = require("discord.js");
const data = require("../models/urun");
module.exports = {
  name: "ürün-bilgi",
  description: "Ürün Bilgi",
  type: 1,
  options: [
    {
      name: "ürün-kodu",
      description: "Ürün Kodu",
      type: 4,
      required: true,
    },
  ],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    let _data = await data.findOne({urunKodu: interaction.options.getInteger("ürün-kodu")});
    if (!_data) return interaction.reply({ content: "Ürün Bulunamadı!" });

    let embed = new MessageEmbed()
    .setTitle(`${_data.name} adlı ürün bilgisi`)
    .setDescription(`${_data.desc}`)
    .addField("Ürün Fiyatı", `${_data.fiyat}TL`,true)
    .addField("Ürün Açıklaması", `${_data.desc}`,true)
    .setFooter({text: `Ürün Kodu: ${_data.urunKodu} | Developed by Gweep Creative`})
    .setThumbnail(client.user.avatarURL())
    .setImage(`${_data.foto}`)

    let butonlar = new MessageActionRow().addComponents(
      new MessageButton().setCustomId(`al-${_data.urunKodu}`).setLabel("Ürünü Satın Al").setEmoji("<:rabelium:958298296865144843>").setStyle("SUCCESS"),
      new MessageButton().setCustomId(`sepet-${_data.urunKodu}`).setLabel("Ürünü Sepete Ekle").setEmoji("🛒").setStyle("SECONDARY"),
    )

    interaction.reply({embeds:[embed],components: [butonlar]});

   
  },
};
