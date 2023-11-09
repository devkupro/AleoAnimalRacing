const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema(
    {
        address: {
            type: String,
            trim: true,
            required: [true, "Address must be required"]
        },
        amount: {
            type: Number,
            default: 0,
        }
    },
    { timestamps: true }
);

const Balance = mongoose.model("Balance", balanceSchema);

module.exports = Balance;