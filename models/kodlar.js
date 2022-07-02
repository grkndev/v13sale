const mongoose = require("mongoose");

const guildSh = new mongoose.Schema({
    kod: { type: String, default: null },
    kullanım: { type: Number, default: 0 },
    tarih: { type: Date, default: null },
    maxKullanım: { type: Number, default: 0 },
    deger: { type: Number, default: 0 },
    limit: { type: Number, default: 0 },
    authorId: { type: String, default: null },
    durum: { type: Boolean, default: false },
    
});

module.exports = mongoose.model("kods", guildSh);