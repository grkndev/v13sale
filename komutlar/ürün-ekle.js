const { MessageEmbed, Client, CommandInteraction,Permissions } = require("discord.js");
const data = require("../models/urun");
module.exports = {
  name: "ürün-ekle",
  description: "Ürün Ekler",
  // default_member_permissions:0x0000000000000008,
  type: 1,
  options: [
    {
      name: "ürün-adı",
      description: "ürün adı",
      type: 3,
      required: true,
    },
    {
      name: "ürün-açıklaması",
      description: "ürün açıklaması",
      type: 3,
      required: true,
    },
    {
      name: "ürün-fiyatı",
      description: "ürün fiyatı",
      type: 4,
      required:true
    },
    {
      name: "ürün-foto",
      description: "ürün hakkında fotoğraf",
      type: 3,
      required:true
    },
    {
      name: "kategori",
      description: "Ürün Kategorisi",
      type: 3,
      
    },
    {
      name: "ürün-kodu",
      description: "ürün açıklaması",
      type: 4,
      required: false,
    },
  ],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({content:"Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısınız.",ephemeral:true});
    let kod = interaction.options.getInteger("ürün-kodu");
    let isim = interaction.options.getString("ürün-adı");
    let ack = interaction.options.getString("ürün-açıklaması");
    let fyt = interaction.options.getInteger("ürün-fiyatı");
    let foto = interaction.options.getString("ürün-foto");

    let kategori = interaction.options.getString("kategori")
      ? interaction.options.getString("kategori")
      : null;

    if (!kod) {
      kod = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      new data({
        name: isim,
        desc: ack,
        ktgry: kategori,
        fiyat: fyt,
        urunKodu: kod,
        foto: foto,
      }).save();
      interaction.reply({embeds:[{
        title: "Ürün Eklendi",
        description: `${kod} kodlu ürün eklendi.`,
        fields:[
          {name:"Ürün Adı",value:isim,inline:true},
          {name:"Ürün Açıklaması",value:ack,inline:true},
          {name:"Ürün Fiyatı",value:`${fyt}`,inline:true},
          {name:"Kategori",value:kategori,inline:true},
          {name:"Ürün Kodu",value:`${kod}`,inline:true},
        ],
        image:{url:foto,width:300,height:100},
      }]})
    }
    else
    {
      await data.updateOne({urunKodu:kod},{upsert:true},{$set:{
        name: isim,
        desc: ack,
        ktgry: kategori,
        fiyat: fyt,
        urunKodu:kod
      }})
      interaction.reply({embeds:[{
        title: "Ürün Güncellendi",
        description: `${kod} kodlu ürün güncellendi.`,
        fields:[
          {name:"Ürün Adı",value:isim,inline:true},
          {name:"Ürün Açıklaması",value:ack,inline:true},
          {name:"Ürün Fiyatı",value:`${fyt}`,inline:true},
          {name:"Kategori",value:kategori,inline:true},
        ]
      }]})
    }
  },
};
