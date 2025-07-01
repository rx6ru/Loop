import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Morgan from "morgan"

const app = express();

app.use(Morgan("dev"))
app.use(express.json());
app.use(cors());






app.listen(3000, () => {
    console.log("Server is running on port 3000");
});