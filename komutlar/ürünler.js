const { MessageActionRow, MessageSelectMenu } = require("discord.js");
const { MessageEmbed, Client, CommandInteraction } = require("discord.js");
const data = require("../models/urun");
module.exports = {
  name: "ürünler",
  description: "Ürün Listesi",
  type: 1,
  options: [
    {
      name: "kategori",
      description: "Ürün Kategorisi",
      type: 3,
      autocomplete: true,
     
    },
  ],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    let _data = await data.find();
    if (!_data) return interaction.reply({ content: "Ürün Bulunamadı!" });

    const kategori = interaction.options.get("kategori")
      ? interaction.options.get("kategori").value
      : null;
    const embed = new MessageEmbed();
    if (kategori) {
      let dat = _data
        .filter((x) => x.ktgry == kategori)
        .sort((a, b) => b.fiyat - a.fiyat);
      if (dat.length > 0) {
        
        let optins = [];
        embed.setTitle(
          `${interaction.options.get("kategori").value.charAt(0).toUpperCase()+interaction.options.get("kategori").value.slice(1)} Bot Listesi`
        );
        dat.forEach((x) => {
          embed.addField(`${x.name}`, `Fiyat: ${x.fiyat}\nürün kodu: ${x.urunKodu}`, true);
          optins.push({label: `${x.name}`, value: `${x.urunKodu}`, emoji:"<a:star5:761479712743620608>"});
        });
        interaction.reply({embeds:[embed],components:[new MessageActionRow().addComponents(
          new MessageSelectMenu().setPlaceholder("Görmek istediğiniz ürünü seçin").setCustomId("ürün-liste").setMaxValues(1).setMinValues(1)
          .setOptions(optins))]});
      } else {
        return interaction.reply({ content: "Ürün Bulunamadı!" });
      }
    } else {
      let dat = _data.sort((a, b) => b.fiyat - a.fiyat);
      let optins = [];
      if (dat) {
        embed.setTitle(`Tüm Botlar Listesi`);
        dat.forEach((x) => {
          embed.addField(`${x.urunKodu} | ${x.name}`, `Fiyat: **${x.fiyat}TL**`, true);
          optins.push({label: `${x.name}`, value: `${x.urunKodu}`, emoji:"<a:star5:761479712743620608>"});
        });
        interaction.reply({embeds:[embed],components:[new MessageActionRow().addComponents(
          new MessageSelectMenu().setPlaceholder("Görmek istediğiniz ürünü seçin").setCustomId("ürün-liste").setMaxValues(1).setMinValues(1)
          .setOptions(optins))]});
      } else {
        return interaction.reply({ content: "Ürün Bulunamadı!" });
      }
    }
  },
};
