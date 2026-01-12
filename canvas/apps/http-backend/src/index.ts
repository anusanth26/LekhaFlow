import "./env.js";
import cors from "cors";
import express from "express";
import { globalErrorHandler } from "./error/error.js";
import { router } from "./routes/index.js";

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cors());

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
