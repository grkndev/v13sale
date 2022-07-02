const { MessageActionRow, Modal } = require("discord.js");
const { MessageSelectMenu } = require("discord.js");
const { Client, CommandInteraction } = require("discord.js");
const fs = require("fs");
const data = require("../models/urun");
const sepet = require("../models/sepet");
const islemler = require("../models/islemler");
const gIsl = require("../models/islemKaydı");
const { MessageButton,MessageEmbed } = require("discord.js");
const {kategori,mod,logKanal,rol1,rol2} = require("../ayarlar.json");
const { createTranscript } = require("discord-html-transcripts");
const { TextInputComponent } = require("discord.js");
const kodData = require("../models/kodlar");

/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 */
module.exports = async (client, interaction, button) => {
  if(interaction.isAutocomplete()){
    if(interaction.commandName == "ürünler"){
      let _data = await data.find();
      const focusedOption = interaction.options.getFocused(true);
		let choices = [];

		if (focusedOption.name === 'kategori') {
      
      _data.map(x => choices.includes(x.ktgry) ? false : choices.push(x.ktgry));
			
		}

		const filtered = choices.filter(choice => choice.startsWith(focusedOption.value.toLowerCase()));
		await interaction.respond(
			filtered.map(choice => ({ name: `${choice.slice(0,1).toUpperCase()}${choice.slice(1).toString()} Botları`, value: choice })),
		);
      /*
       choices: [
        { name: "Status Botlar", value: "status" },
        { name: "Moderasyon Botlar", value: "moderasyon" },
        { name: "Genel Botlar", value: "genel" },
      ],
      */
    }
  }
  if(interaction.isModalSubmit()){
    if(interaction.customId == "kod-kullan"){
      await interaction.reply({content:`Kod Uygulanıyor`,ephemeral:true});
      let kod = interaction.fields.getTextInputValue('girilen-kod');
      let _data = await kodData.findOne({kod});
      if(!_data) return interaction.editReply({content:`Kod Bulunamadı`,ephemeral:true});
      if(_data.maxKullanım <= _data.kullanım) return interaction.editReply({content:`Bu kod maximum kullanım değerine ulaştı`,ephemeral:true});
      if(_data.durum = false) return interaction.editReply({content:`Geçersiz Kod`,ephemeral:true});
      
      let urun = await islemler.findOne({memberId:interaction.member.id});
      if(_data.limit > urun.fiyat) return interaction.editReply({content:`Bu kodu sadece ${_data.limit}TL ve üzeri alışverişlerinizde kullanabilirsiniz`,ephemeral:true});
      await kodData.updateOne({kod},{$inc:{kullanım:1}});
      var sepetdata = urun.sepet.map(a => a.urunler)
      
      
      interaction.message.edit({components:[
        new MessageActionRow().addComponents(
            new MessageButton().setStyle("SUCCESS").setLabel("Şipariş Tamamlandı").setEmoji("<:tik:971772378453540905>").setCustomId(`tamamlandı`),
            new MessageButton().setLabel("Şiparişi İptal Et").setEmoji("<:cop:971772378357039124>").setCustomId(`iptal`).setStyle("DANGER"),
            new MessageButton().setLabel("Promosyon Kodu Kullanıldı").setEmoji("<a:star5:761479712743620608>").setCustomId(`promosyon`).setStyle("SECONDARY").setDisabled(true),
        )
      ],
        embeds:[
          {
            title:"Şiparişiniz hazırlanıyor - "+urun.islemKodu,
            description:`Siparişiniz ödeme tamamlandıktna sonra yetkili üzerinden verilecektir`,
  fields:[
    {name:"Ürün",value:sepetdata.map((urun) => urun.map((a,index) => `${index+1}. ${a.name}`)).join("\n"),inline:true},
    {name:"Fiyat",value:`~~${urun.fiyat}TL~~ **${(urun.fiyat-_data.deger).toString().slice(0,5)}TL**`,inline:true},
    {name: "Ödeme Yöntemi", value: `${urun.yontem == "papara" ? "<:papara:992005739793092738> Papara \n↬ Papara hesap no: **1642201859**" : "<:itemsatis:992006158267207680> İtemsatış"}`,inline:false},
    {name:"Promosyon",value:`Uygulanan Kod: ${kod}\nKod Değeri: ${_data.deger}TL`,inline:true},
  ],
footer:{text: `Sipariş Kodunuz: ${urun.islemKodu}`}}]
      })
      interaction.editReply({content:`\`${kod}\` promosyon kodu başarıyla uygulandı`})
    }
  }
  if(interaction.isSelectMenu()){
    if(interaction.customId.startsWith("satinal-")){
      let kod = interaction.customId.split("-")[1];
      let iskod = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      let tur = interaction.values[0];
      let urun = await data.findOne({urunKodu:parseInt(kod)});
      if(!urun) return interaction.reply({content:"Ürün Bulunamadı"});
      let total = urun.fiyat;
      if(interaction.member.roles.cache.has(rol1))
      {
        total = total - 3;
      }
      if(interaction.member.roles.cache.has(rol2))
      {
        total = total - 2;
      }

      await interaction.guild.channels.create(`bekliyor-${urun.name}`,{
        type:"GUILD_TEXT",
        parent:kategori,
        permissionOverwrites:[
          {
            id:interaction.member.id,
            allow:["VIEW_CHANNEL","SEND_MESSAGES","ATTACH_FILES","READ_MESSAGE_HISTORY","USE_APPLICATION_COMMANDS","EMBED_LINKS"]
          },
          {
            id:mod,
            allow:["VIEW_CHANNEL","SEND_MESSAGES","ATTACH_FILES","READ_MESSAGE_HISTORY","USE_APPLICATION_COMMANDS","EMBED_LINKS"]
          },
          {
            id:interaction.guild.id,
            deny:["VIEW_CHANNEL"]
          }
        ]
      }).then(async (knl) => {
        
        await islemler.create({
          memberId: interaction.member.id,
        channelId: knl.id,
        sepet: urun,
        fiyat: tur == "papara" ? total - (total * 7 / 100) : total + (total * 7 / 100) + (total * 5 / 100),
        yontem: tur,
        tarih: new Date(),
        islemTuru: "ürün",
        islemKodu: iskod
    })
        knl.send(
          {components:[new MessageActionRow().addComponents(
            // new MessageButton().setStyle("SUCCESS").setLabel("Şipariş Tamamlandı").setEmoji("<:tik:971772378453540905>").setCustomId(`tamamlandı`),
            // new MessageButton().setLabel("Şiparişi İptal Et").setEmoji("<:cop:971772378357039124>").setCustomId(`iptal`).setStyle("DANGER"),
            new MessageButton().setLabel("Şiparişi Onayla").setEmoji("<:tickk:831064418410430474>").setCustomId(`onayla`).setStyle("PRIMARY")
          )],
            content:`${interaction.member} sipişin şuanda onay bekliyor, bu süreçte sormak istediğin merak ettiğin bir şey varsa bize söylemekten çekinme!.`,
            embeds:[
              {
                title:"Şiparişiniz hazırlanıyor -"+iskod,
                description:`**${urun.name}** adlı ürün siparişiniz ödeme tamamlandıktna sonra yetkili üzerinden verilecektir`,
      fields:[
        {name:"Ürün",value:urun.name,inline:true},
        {name:"Fiyat",value:`${tur == "papara" ? total - (total * 7 / 100) : total + (total * 7 / 100)+ (total * 5 / 100)}TL`,inline:true},
        {name: "Ödeme Yöntemi", value: `${tur == "papara" ? "<:papara:992005739793092738> Papara \n↬ Papara hesap no: **1642201859**" : "<:itemsatis:992006158267207680> İtemsatış"}`,inline:false}
      ],
    footer:{text: `Sipariş Kodunuz: ${iskod}`}}]})
      interaction.reply({content:`Harikaa!! siparişini burdan takip edebilirsin --> <#${knl.id}>`,ephemeral:true})
      })
      .catch((err) => {interaction.reply({content:`${err}`})})
      return;
    }
    if(interaction.customId == `ürün-liste`){
      let kod = interaction.values[0];
      let _data = await data.findOne({urunKodu: parseInt(kod)});
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
    return;
    }
    if(interaction.customId == `sil-${interaction.member.id}`){
      if(interaction.values[0].toString() == "hepsinisil"){
        await sepet.deleteOne({memberId: interaction.member.id});
        interaction.reply({embeds: [{title:"Sepetiniz başarıyla temizlendi!"}],ephemeral:true});
        return;
      }
      else{
        
      let kod = interaction.values[0].split("-")[0];
      let fiyatBilgisi = interaction.values[0].split("-")[1];
      const row = new MessageActionRow().addComponents(new MessageButton().setCustomId("sepetigör").setLabel("Sepetimi Görüntüle").setEmoji("🛒").setStyle("SECONDARY"))
      await sepet.updateOne({memberId: interaction.member.id},{$inc:{tutar: -fiyatBilgisi},$pull: {urunler: {urunKodu: parseInt(kod)}}});
      interaction.reply({components:[row],content: kod+" koduna sahip ürün sepetinizden başarıyla silindi!",ephemeral:true});
      return;
      }
    }

    if(interaction.customId == `ayarlar-${interaction.member.id}`){
      if(interaction.values[0].toString() == "hepsinisil"){
        await sepet.deleteOne({memberId: interaction.member.id});
        interaction.reply({embeds: [{title:"Sepetiniz başarıyla temizlendi!"}],ephemeral:true});
        return;
      }
      if(interaction.values[0].toString() == "düzenle"){
        let sepetbilgisi = await sepet.findOne({memberId: interaction.member.id});
        if(!sepetbilgisi)return interaction.reply({embeds: [{title:"Sepetiniz henüz bir ürün yok!"}]});
        interaction.reply({ephemeral:true,components:[new MessageActionRow().addComponents(
          new MessageSelectMenu().setCustomId(`sil-${interaction.member.id}`).setPlaceholder("Silmek istediğiniz ürünlerinizi seçiniz")
          .setMaxValues(1).setMinValues(1).setOptions([
            {label: "Tümünü Sil",description:"Tümünü silmek istiyorum" ,value:"hepsinisil",emoji:"<:cop:971772378357039124>"},
            sepetbilgisi.urunler.map((urun) => {
              return {label: `${urun.urunKodu} - ${urun.name}`,value:`${urun.urunKodu}-${urun.fiyat}`,emoji:"<:cop:971772378357039124>"}
            })
          ])
        )],embeds:[{title:"Sepeti Düzenle",description:`${sepetbilgisi.urunler.map((urun,index) => `${index+1}.${urun.name} - ${urun.fiyat}TL`).join("\n")}`}]});
      return;
      }
      else
      {
          let musteriId = interaction.customId.split("-")[1];
          let iskod = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
          let tur = interaction.values[0];
          let urun = await sepet.findOne({memberId:musteriId});
          if(!urun) return interaction.reply({content:"Ürün Bulunamadı"});
          let total = urun.urunler.map((urun) => urun.fiyat).reduce((a,b) => a+b);
          
          if(interaction.member.roles.cache.has(rol1))
          {
             total = total - 3;
           }
          if(interaction.member.roles.cache.has(rol2))
           {
             total = total - 2;
           }
           
          await interaction.guild.channels.create(`bekliyor-sepet-${interaction.guild.members.cache.get(musteriId).user.username}`,{
            type:"GUILD_TEXT",
            parent:kategori,
            permissionOverwrites:[
              {
                id:interaction.member.id,
                allow:["VIEW_CHANNEL","SEND_MESSAGES","ATTACH_FILES","READ_MESSAGE_HISTORY","USE_APPLICATION_COMMANDS","EMBED_LINKS"]
              },
              {
                id:mod,
                allow:["VIEW_CHANNEL","SEND_MESSAGES","ATTACH_FILES","READ_MESSAGE_HISTORY","USE_APPLICATION_COMMANDS","EMBED_LINKS"]
              },
              {
                id:interaction.guild.id,
                deny:["VIEW_CHANNEL"]
              }
            ]
          }).then(async (knl) => {
            
            await islemler.create({
              memberId: interaction.member.id,
            channelId: knl.id,
            sepet: urun,
            fiyat: tur == "papara" ? total - (total * 7 / 100) : total + (total * 7 / 100) + (total * 5 / 100),
            yontem: tur,
            tarih: new Date(),
            islemTuru: "sepet",
            islemKodu: iskod
        })
            knl.send(
              {components:[new MessageActionRow().addComponents(
                // new MessageButton().setStyle("SUCCESS").setLabel("Şipariş Tamamlandı").setEmoji("<:tik:971772378453540905>").setCustomId(`tamamlandı`),
                // new MessageButton().setLabel("Şiparişi İptal Et").setEmoji("<:cop:971772378357039124>").setCustomId(`iptal`).setStyle("DANGER"),
                new MessageButton().setLabel("Şiparişi Onayla").setEmoji("<:tickk:831064418410430474>").setCustomId(`onayla`).setStyle("PRIMARY")
              )],
                content:`${interaction.member} sipişin şuanda onay bekliyor, bu süreçte sormak istediğin merak ettiğin bir şey varsa bize söylemekten çekinme!.`,
                embeds:[
                  {
                    title:"Şiparişiniz hazırlanıyor -"+iskod,
                    description:`Siparişiniz ödeme tamamlandıktan sonra yetkili üzerinden verilecektir`,
          fields:[
            {name:"Ürünler",value:`${urun.urunler.map((urun,index) => `${index+1}. ${urun.name}`).join("\n")}`,inline:true},
            {name:"Fiyat",value:`${tur == "papara" ? total - (total * 7 / 100) : total + (total * 7 / 100)+ (total * 5 / 100)}TL`,inline:true},
            {name: "Ödeme Yöntemi", value: `${tur == "papara" ? "<:papara:992005739793092738> Papara \n↬ Papara hesap no: **1642201859**" : "<:itemsatis:992006158267207680> İtemsatış"}`,inline:false}
          ],
        footer:{text: `Sipariş Kodunuz: ${iskod}`}}]})
          interaction.reply({content:`Harikaa!! siparişini burdan takip edebilirsin --> <#${knl.id}>`,ephemeral:true})
          })
          .catch((err) => {interaction.reply({content:`${err}`})})
          return;
        
      }
     }
  }
  if(interaction.isButton()){
    if(interaction.customId == "promosyon"){
      const modal = 
      new Modal().setCustomId("kod-kullan").setTitle("Promosyon Kodu Kullan!").setComponents(
        new MessageActionRow().addComponents(
          new TextInputComponent()
        .setCustomId("girilen-kod").setLabel("Promosyon kodunuzu giriniz").setStyle("SHORT")
        .setPlaceholder("Promosyon Kodunuz").setMinLength(7).setMaxLength(7).setRequired(true)
        ))

     await interaction.showModal(modal)
      return;
    }
    if(interaction.customId ==`tamamlandı`){
      let _data = await islemler.findOne({channelId:interaction.message.channelId});
      if(!_data) return interaction.reply({content: "bu kanal hakkında veri bulamıyorum"});
      if(!interaction.member.roles.cache.has(mod)) return interaction.reply({content: "bunu sen yapamazsın",ephemeral:true});
      interaction.reply({content:`Sipariş Moderatör tarafından onaylandı!`})
      interaction.channel.send({content:"Mesaj Geçmişi Kaydediliyor"})
      const dosya = await createTranscript(interaction.message.channel, {
        limit: -1,
        returnBuffer: false,
        fileName: `tamamlandı-${_data.islemKodu}-${_data.memberId}.html`,
      });
      interaction.channel.send({content:"Mesaj Geçmişi kaydedildi. İşlem kaydediliyor"})
      await gIsl.updateOne({memberId:_data.memberId},{
          $inc:{toplam:_data.fiyat},
          $push:{sepet:_data.sepet},
          $set:{sonTarih: Date.now()}
      },{upsert:true})
      let sipData = await islemler.findOne({channelId:interaction.message.channelId});
      if(sipData.islemTuru == "sepet"){ await sepet.deleteOne({memberId:_data.memberId});}
      interaction.guild.channels.cache.get(logKanal).send({
        embeds: [new MessageEmbed().setColor("GREEN").setTitle("Sipariş Onaylandı")
        .setDescription(
          `Müşteri Kullanıcı : <@${sipData.memberId}>(\`${sipData.memberId}\`)
          Siparişi Kabul Eden: ${interaction.member}(\`${interaction.member.id}\`)
          Sipariş Kodu: ${sipData.islemKodu}
          Sipariş Tutarı: ${sipData.fiyat}TL
          Açılış Tarihi: <t:${parseInt(sipData.tarih / 1000)}:R>
          Kapanış Tarihi: <t:${parseInt(new Date() / 1000)}:R>
          `
          )],
        files: [dosya],
      });
      await islemler.deleteOne({channelId:interaction.message.channelId});
      interaction.channel.send({content:"İşlem kaydedildi. Kanal Silinyor"})
      setTimeout(() => {interaction.channel.delete();},3000)
      return;
    }

    if(interaction.customId == `iptaledildi`){
      let _data = await islemler.findOne({channelId:interaction.message.channelId});
      if(!_data) return interaction.reply({content: "bu kanal hakkında veri bulamıyorum"});

      interaction.member.roles.cache.has(mod) ? interaction.reply({content:`Sipariş Moderatör tarafından iptal edildi!`}) : interaction.reply({content:`Sipariş Müşteri tarafından iptal edildi!`})
      interaction.channel.send({content:"Mesaj Geçmişi Kaydediliyor"})
      const dosya = await createTranscript(interaction.message.channel, {
        limit: -1,
        returnBuffer: false,
        fileName: `iptal-${_data.memberId}.html`,
      });
      interaction.channel.send({content:"Mesaj Geçmişi kaydedildi. İşlem kaydediliyor"})
     
      let sipData = await islemler.findOne({channelId:interaction.message.channelId});
      interaction.guild.channels.cache.get(logKanal).send({
        embeds: [new MessageEmbed().setColor("RED").setTitle("Sipariş İptal Edildi")
        .setDescription(
          `Müşteri Kullanıcı : <@${sipData.memberId}>(\`${sipData.memberId}\`)
          Siparişi İptal Eden: ${interaction.member}(\`${interaction.member.id}\`)
          Sipariş Kodu: ${sipData.islemKodu}
          Sipariş Tutarı: ${sipData.fiyat}TL
          Açılış Tarihi: <t:${parseInt(sipData.tarih / 1000)}:R>
          Kapanış Tarihi: <t:${parseInt(new Date() / 1000)}:R>
          `
          )],
        files: [dosya],
      });
      await islemler.deleteOne({channelId:interaction.message.channelId});
      interaction.channel.send({content:"İşlem kaydedildi. Kanal Silinyor"})
      setTimeout(() => {interaction.channel.delete();},3000)
      return;
    }
    if(interaction.customId == `iptal`){
      if(!interaction.member.roles.cache.has(mod)) return interaction.reply({content:"Bunu yapamazsın",ephemeral:true})
      interaction.reply({ephemeral:true,content:"Siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz",components:[
        new MessageActionRow().addComponents(new MessageButton()
        .setCustomId("iptaledildi").setLabel("Evet! İptal Et").setStyle("DANGER").setEmoji("<:r_dikkat:971472505837609041>"))
      ]})
      return;
    }
    if(interaction.customId == "onayla"){
      if(!interaction.member.roles.cache.has(mod)) return interaction.reply({content:"Bunu yapamazsın",ephemeral:true})
      interaction.message.edit({components:[
        new MessageActionRow().addComponents(
            new MessageButton().setStyle("SUCCESS").setLabel("Şipariş Tamamlandı").setEmoji("<:tik:971772378453540905>").setCustomId(`tamamlandı`),
            new MessageButton().setLabel("Şiparişi İptal Et").setEmoji("<:cop:971772378357039124>").setCustomId(`iptal`).setStyle("DANGER"),
            new MessageButton().setLabel("Promosyon Kodu Kullan").setEmoji("<a:star5:761479712743620608>").setCustomId(`promosyon`).setStyle("SECONDARY"),
        )
      ]})
      interaction.channel.edit({name:`ödeme-bekleniyor`})
      interaction.reply({content:"Sipariş onaylandı. Ödeme Bekleniyor"})
      return;
    }
    if(interaction.customId == "sepetigör"){
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
      **<:papara:992005739793092738> Papara ile öderseniz: ${(total - (total * 7 / 100)).toString().slice(0,4)}TL**
      **<:itemsatis:992006158267207680> İtemsatış ile öderseniz: ${(total + (total * 7 / 100) + (total * 5 / 100)).toString().slice(0,4)}TL**`)

      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu().setCustomId(`ayarlar-${interaction.member.id}`).setPlaceholder("Sepet Ayarları")
        .setMaxValues(1).setMinValues(1).setOptions([
          {label: "Papara ile ödemeyi tamamla",description:"Papara ile ödemek istiyorum" ,value:"papara",emoji:"<:papara:992005739793092738>"},
          {label: "İtemsatış ile ödemeyi tamamla",description:"İtemsatış ile ödemek istiyorum" ,value:"itemsatis",emoji:"<:itemsatis:992006158267207680>"},
          {label: "Sepeti Düzenle",description:"sepetimi düzenlemek istiyorum" ,value:"düzenle",emoji:"<:ayarlar:971772378063450133>"},
          {label: "Sepeti Boşalt",description:"Sepetimdeki tüm ürünleri silmek istiyorum" ,value:"hepsinisil",emoji:"<:cop:971772378357039124>"},
        ])
      )

      interaction.reply({embeds: [embed],components: [row],ephemeral:true});
      
    }
    else{
      let tur = interaction.customId.split("-")[0];
    let kod = interaction.customId.split("-")[1];
    
    let _data = await data.findOne({urunKodu:parseInt(kod)}) || null;
    if(_data){
      if(tur == "al"){
        const row = new MessageActionRow().addComponents(
          new MessageSelectMenu().setCustomId(`satinal-${_data.urunKodu}`).setPlaceholder("Ödeme Yönetmini Seçiniz")
          .setMaxValues(1).setMinValues(1).setOptions([
            {label: "Papara ile öde (%7 indirim!)",description:"Papara ile ödemek istiyorum" ,value:"papara",emoji:"<:papara:992005739793092738>"},
            {label: "İtemsatış ile öde (ek ücret tahsil edilir)",description:"İtemsatış ile ödemek istiyorum" ,value:"itemsatis",emoji:"<:itemsatis:992006158267207680>"},
          ])
        )
        interaction.reply({embeds:[{title:"Ödeme Yöntemi Seç",description:"Satın Alma için kullanıcağınız ödeme yönetmini seçin"}],
        components:[row],ephemeral:true});
        return;
      }
      else if(tur == "sepet"){
        let bilgiler = await sepet.findOne({memberId: interaction.member.id, urunler: {$elemMatch:{urunKodu:parseInt(kod)}}});
        if(bilgiler)return interaction.reply({ephemeral:true,components:[new MessageActionRow().addComponents(
          new MessageButton().setLabel("Sepetimi görünütle").setCustomId("sepetigör").setEmoji("🛒").setStyle("SECONDARY")
        )],embeds: [{title:"Sepetinizde zaten bu ürün var!"}]});
        await sepet.updateOne({memberId:interaction.member.id},{$inc:{tutar:_data.fiyat},$push:{urunler:_data}},{upsert:true})
        const row = new MessageActionRow().addComponents(new MessageButton().setCustomId("sepetigör").setLabel("Sepetimi Görüntüle").setEmoji("🛒").setStyle("SECONDARY"))
        interaction.reply({embeds: [{title:"Ürün Sepete Eklendi!"}],components:[row],ephemeral:true});
      }
      
    }

    else{interaction.reply({content: "Ürün Bulunamadı!",ephemeral:true})}
    return;
    }
  }




  if (interaction.isCommand()) {
    try {
      fs.readdir("./komutlar/", (err, files) => {
        if (err) throw err;

        files.forEach(async (f) => {
          const command = require(`../komutlar/${f}`);
          if (
            interaction.commandName.toLowerCase() === command.name.toLowerCase()
          ) {
            return command.run(client, interaction);
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
};

