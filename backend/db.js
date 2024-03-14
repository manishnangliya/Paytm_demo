const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:Yc2ZoqILvgAeAqn5@cluster0.uygtgfm.mongodb.net/PaytmDemo';
mongoose.connect(url);
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    firstName:String,
    lastName:String,
    password:String
});

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    balance:{
        type:Number,
        required:true
    }
}) 


const User = mongoose.model('Users',userSchema);
const Account = mongoose.model('Accounts',accountSchema);

module.exports = {
    User,
    Account
}