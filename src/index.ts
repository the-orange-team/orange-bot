import express from "express";

const app = express();
app.use(express.json());
app.get("/rafaelTchola", (request, response) => {
  return response.status(200).json({ message: "full tchola" });
});
app.listen(3333);
