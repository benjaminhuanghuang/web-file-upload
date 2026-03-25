import dotenv from "dotenv";
import app from "./app.ts";
import type { env } from "process";
dotenv.config();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
