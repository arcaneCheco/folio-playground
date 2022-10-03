import express from "express";
import fetch from "node-fetch";
import * as path from "path";
import { getClient } from "./client.mjs";
import * as dotenv from "dotenv";
import { dummyData } from "./data.mjs";
dotenv.config();

const app = express();

const client = getClient({
  endpoint: process.env.PRISMIC_ENDPOINT || "",
  fetch,
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
});

const PORT = process.env.PORT || 3001;

const __dirname = path.resolve("./");

app.use(express.static(`${__dirname}/dist`));

app.set("view engine", "pug");
app.set("index", `${__dirname}/views`);

const handleRequest = async () => {
  const projects = (await client.getAllByType("project")).map((entry) => {
    const data = entry.data;
    data.demo = data.demo.url;
    data.source = data.source.url;
    return data;
  });

  let { assets, fonts, svgs } = (await client.getSingle("assets")).data;

  const mySvgs = {};
  svgs.map((entry) => {
    mySvgs[entry.name] = entry.data.url;
  });

  const myAssets = {};
  assets.map(({ item }) => {
    myAssets[item.alt] = item.url;
  });

  const myFonts = {};
  await Promise.all(
    fonts.map(async (entry) => {
      const data = await fetch(entry.data.url).then((res) => res.json());
      myFonts[entry.name] = {
        map: entry.map.url,
        data,
      };
    })
  );

  return {
    projects,
    assets: myAssets,
    fonts: myFonts,
    svgs: mySvgs,
  };
};

app.get(["/", "/about", "/projects"], async (req, res) => {
  // const data = await handleRequest();
  const data = dummyData;

  res.render("index", data);
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

export default app;
