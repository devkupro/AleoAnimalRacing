const mongoose = require("mongoose");

const nftSchema = new mongoose.Schema(
    {
        address: {
            type: String,
            trim: true,
            required: [true, "Address must be required"]
        },
        nftId: {
            type: String,
            required: true,
        },
        baseUrl: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

const Nft = mongoose.model("Nft", nftSchema);

module.exports = Nft;