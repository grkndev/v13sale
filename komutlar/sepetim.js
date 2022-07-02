const { MessageEmbed, Client, CommandInteraction,MessageActionRow,MessageButton,MessageSelectMenu } = require("discord.js");
const sepet = require("../models/sepet");
const {rol1,rol2} = require("../ayarlar.json");
module.exports = {
  name: "sepetim",
  description: "sepetinizi gösterir",
  type: 1,
  options: [],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    
    let bilgiler = await sepet.findOne({memberId: interaction.member.id});
    if(!bilgiler || bilgiler?.urunler?.length == 0)return interaction.reply({ephemeral:true,embeds: [{title:"Sepetinizde henüz bir ürün yok!"}]});
    let anatotal = bilgiler.tutar;
    let total = bilgiler.tutar;
    let indMsg = "İndirim uygulanmamış";
    if(interaction.member.roles.cache.has(rol1))
    {
      total = total - 3;
      indMsg == "İndirim uygulanmamış" ? indMsg = "\nYoutube Katıl Üyemiz olduğunuz için **3 TL** indirim uygulandı!" : indMsg = indMsg+"\nYoutube Katıl Üyemiz olduğunuz için **3 TL** indirim uygulandı!";
    }
    if(interaction.member.roles.cache.has(rol2))
    {
      total = total - 2;
      indMsg == "İndirim uygulanmamış" ? indMsg = "\nBooster Üyemiz olduğunuz için **2 TL** indirim uygulandı!" : indMsg = indMsg+"\nBooster Üyemiz olduğunuz için **2 TL** indirim uygulandı!";
    }
    let embed = new MessageEmbed().setTitle(`${interaction.member.user.username} adlı kullanıcının sepeti`)
    .setColor("GOLD").setDescription(`--------------------------------------------------------------------------------
    ${bilgiler.urunler.map((urun,index) => `${index+1}.${urun.name} - ${urun.fiyat}TL`).join("\n")}
    
    **🛒 Toplam Tutar: ${total}TL**
    --------------------------------------------------------------------------------
    **İndirim Bilgisi:** ${indMsg}
    --------------------------------------------------------------------------------
    **<:papara:992005739793092738> Papara ile öderseniz: ${(total - (total * 7 / 100)).toString().slice(0,5)}TL**
    **<:itemsatis:992006158267207680> İtemsatış ile öderseniz: ${(total + (total * 7 / 100) + (total * 5 / 100)).toString().slice(0,5)}TL**`)

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu().setCustomId(`ayarlar-${interaction.member.id}`).setPlaceholder("Ödeme ve Ayarlar")
      .setMaxValues(1).setMinValues(1).setOptions([
        {label: "Papara ile ödemeyi tamamla",description:"Papara ile ödemek istiyorum" ,value:"papara",emoji:"<:papara:992005739793092738>"},
        {label: "İtemsatış ile ödemeyi tamamla",description:"İtemsatış ile ödemek istiyorum" ,value:"itemsatis",emoji:"<:itemsatis:992006158267207680>"},
        {label: "Sepeti Düzenle",description:"sepetimi düzenlemek istiyorum" ,value:"düzenle",emoji:"<:ayarlar:971772378063450133>"},
        {label: "Sepeti Boşalt",description:"Sepetimdeki tüm ürünleri silmek istiyorum" ,value:"hepsinisil",emoji:"<:cop:971772378357039124>"},
      ])
    )

    interaction.reply({embeds: [embed],components: [row],ephemeral:true});
  },
};
