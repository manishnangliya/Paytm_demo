const express = require('express');
const { Account } = require('../db');
const authMiddleware = require('../middleware');
const { default: mongoose } = require('mongoose');
const accountRoute = express.Router();

accountRoute.get('/balance', authMiddleware, async (req, res) => {
    const id = req.userId;
    const accountDetails = await Account.findOne({ userId: id });
    res.json({
        balance: accountDetails.balance
    })
});


accountRoute.post('/transfer', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    myId = req.userId;
    toId = req.body.to;
    amount =  req.body.amount
    const fromAccount = Account.findOne({ userId: myId }).session(session);

    if (!fromAccount ||  fromAccount.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        })
    }

    const toAccount = Account.findOne({ userId: toId }).session(session);
    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        })
    }
    await Account.updateOne({ userId: myId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: toId }, { $inc: { balance: amount } }).session(session);
    
    await session.commitTransaction();

    res.json({
        message: "Transfer successful"
    })


});

module.exports = accountRoute;