const express = require("express");
const router = require("./routes");
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors())

app.use(express.json());

app.use("/api/v1",router);

app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`);
})


module.exports = {
    router
}

