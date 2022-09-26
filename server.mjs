import express from "express";
import * as path from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";

let data = fs.readFileSync("./data.json");
data = JSON.parse(data);

let font1 = fs.readFileSync("./src/text/Audiowide-Regular.json");
font1 = JSON.parse(font1);
data.fonts.audiowide.data = font1;
data.fonts.audiowide.url = "Audiowide-Regular.ttf.png";

const app = express();

const PORT = 1234;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(`${__dirname}/dist`));

app.set("view engine", "pug");
app.set("index", `${__dirname}/views`);

app.get(
  ["/", "/projects", "/projects/:project", "/about"],
  async (req, res) => {
    res.render("index", {
      projects: data.projects,
      fonts: data.fonts,
    });
  }
);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

export default app;
