const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const { getClient } = require("./client.js");
require("dotenv").config();

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
      const url = entry.map.url.split("?auto=")[0];
      myFonts[entry.name] = {
        map: url,
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

const viewResolver = (url, projectsArray) => {
  let view = "";
  switch (true) {
    case url === "/projects" || path === "/projects/":
      view = "Projects";
      break;
    case url === "/":
      view = "Home";
      break;
    case url === "/about" || url === "/about/":
      view = "About";
      break;
    case projectsArray
      .map(({ path }) => [path, path + "/"])
      .flat()
      .includes(url):
      view = "ProjectDetail";
      break;
    default:
      view = "404";
      break;
  }
  return view;
};

app.get("*", async (req, res) => {
  const data = await handleRequest();

  const { path } = req;
  const view = viewResolver(path, data.projects);
  // const data = dummyData;
  res.render("index", { ...data, view });
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

module.exports = app;
