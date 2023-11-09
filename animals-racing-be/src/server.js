const express = require('express');
const cors = require('cors');
const app = express();

const mongoose = require('mongoose');
const Balance = require('./models/balance');
const Nft = require('./models/Nft');

mongoose.connect('mongodb://127.0.0.1:27017/race-animals')
    .then(() => console.log('Connected!'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/balance', async (req, res) => {
    try {
        const { address } = req.query;
        if (!address)
            return res.status(400).json({ message: "not found address" });
        const rs = await Balance.findOne({ address });
        return res.status(200).json({ amount: rs.amount });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
})

app.post('/balance', async (req, res) => {
    try {
        const { address, amount, method } = req.body;
        if (!address || !amount)
            return res.status(400).json({ message: "body incorrect" });
        const rs = await Balance.findOne({ address });
        if (!rs) {
            const addNew = new Balance({
                address,
                amount
            })
            await addNew.save();
            return res.status(200).json({ message: "success" })
        }
        let newBalance = 0;
        if (method === "+") {
            newBalance = rs.amount + amount;
        } else if (method === "-") {
            newBalance = rs.amount - amount;
        }
        const rs2 = await Balance.findOneAndUpdate({ address }, { $set: { amount: newBalance } });
        return res.status(200).json({ message: "success" });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
})

app.get('/nft', async (req, res) => {
    try {
        const { address } = req.query;
        if (!address)
            return res.status(400).json({ message: "not found address" });
        const rs = await Nft.find({ address });
        return res.status(200).json({ nfts: rs });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
})

app.post('/nft', async (req, res) => {
    try {
        const { address, nftId, baseUrl } = req.body;
        if (!address || !baseUrl || nftId === undefined)
            return res.status(400).json({ message: "error with body" });
        const nft = new Nft({
            address,
            nftId,
            baseUrl
        })
        await nft.save();
        return res.status(200).json(nft);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
})

app.listen(process.env.PORT || 8000, () => {
    console.log('Server is running on port', process.env.PORT || 8000);
})