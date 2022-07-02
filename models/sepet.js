const mongoose = require("mongoose");

const guildSh = new mongoose.Schema({
    memberId: { type: String, default: "" },
    urunler: { type: Array, default: [] },
    tutar: { type: Number, default: 0 }
});

module.exports = mongoose.model("sepet", guildSh);