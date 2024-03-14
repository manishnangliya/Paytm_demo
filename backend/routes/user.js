const express = require('express');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const authMiddleware = require('../middleware');
const { User, Account } = require('../db');
const userRoute = express.Router();

const usernameSchema = zod.string().email();
const firstNameSchema = zod.string().min(2).max(15).regex(new RegExp(new RegExp('[a-zA-Z]')));
const lastNameSchema = zod.string().min(2).max(15).regex(new RegExp(new RegExp('[a-zA-Z]')));
const passwordSchema = zod.string().min(4).max(14);


userRoute.post('/signup', async (req, res) => {
    const username = req.body.username;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;

    const usernameOutput = usernameSchema.safeParse(username);
    const firstNameOutput = firstNameSchema.safeParse(firstName);
    const lastNameOutput = lastNameSchema.safeParse(lastName);
    const passwordOutput = passwordSchema.safeParse(password);
    if (!usernameOutput.success || !firstNameOutput.success || !lastNameOutput.success || !passwordOutput.success) {
        return res.status(411).json({
            message: "Please Give valid Input"
        })
    }
    const existUser = await User.findOne({ username });
    if (existUser) {
        return res.status(411).json({
            message: "User already Present"
        })
    }
    const userData = await User.create({
        username,
        firstName,
        lastName,
        password
    })
    const id = userData._id;
    await Account.create({
        userId:id,
        balance: 1+ Math.random()*10000

    })
    const encodedId = jwt.sign({ id }, JWT_SECRET);
    res.send({
        message: "User created successfully",
        token: encodedId
    })
})

userRoute.post('/signin', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const usernameOutput = usernameSchema.safeParse(username);
    const passwordOutput = passwordSchema.safeParse(password);
    if (!usernameOutput || !passwordOutput) {
        return res.status(411).json({
            message: "Incorrect Inputs"
        })
    }
    const usernameExist = await User.findOne({ username });
    if (usernameExist) {
        const passMatched = await User.findOne({ username, password });
        if (passMatched) {
            const userId = passMatched._id;
            const encodedId = jwt.sign({ userId }, JWT_SECRET);
            res.json({
                token: encodedId
            })
        }
        else {
            return res.status(411).json({
                message: "Password Not correct"
            })
        }
    }
    else {
        return res.status(411).json({
            message: "Username not Exists"
        });
    }
})

userRoute.put('/', authMiddleware, async (req, res) => {
    const updatedFieldSchema = zod.object({
        firstName: zod.string().min(2).max(15).regex(new RegExp(new RegExp('[a-zA-Z]'))).optional(),
        lastName: zod.string().min(2).max(15).regex(new RegExp(new RegExp('[a-zA-Z]'))).optional(),
        password: zod.string().min(4).max(14).optional()
    })
    const userId = req.userId;
    const isUpdateValid = updatedFieldSchema.safeParse(req.body);
    if (!isUpdateValid.success) {
        return res.status(411).json({
            message: "Invalid Input"
        })
    }
    const ans = await User.findOneAndUpdate({ _id: userId }, req.body);
    console.log(ans);
    res.json({
        message: "Field Updates Successfully"
    })
})

userRoute.get('/bulk', async (req, res) => {
    const filter = req.query.filter || "";
    const response = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })
    const bulkResponse = response.map(user => ({
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id
    }))
    res.json({
        users: bulkResponse
    })
})

module.exports = userRoute;