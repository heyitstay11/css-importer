#!/usr/bin/env node
"use strict";

var { readFile, writeFile } = require("fs/promises");
var { join } = require("path");
var currDir = process.cwd();
var cssPath = process.argv?.[2];
var cssDir = cssPath.slice(0, cssPath.lastIndexOf("/"));
var cssFile = cssPath.slice(cssPath.lastIndexOf("/"));
var outPath = process.argv?.[3] || join(cssDir, "dist.css");
var pathToCSSFile = join(currDir, cssDir, cssFile);
var fileStr;
var opts = { encoding: "utf-8" };
var regex = /@import\s?(url\()?\".*css\"\)?;/gi;

(async () => {
  try {
    fileStr = await readFile(pathToCSSFile, opts);
    const result = fileStr.match(regex) || [];
    for await (const res of result) {
      try {
        const relativePath = res.split('"')[1];
        const pathToFile = join(currDir, cssDir, relativePath);
        const data = await readFile(pathToFile, opts);
        fileStr = fileStr.replace(res, data);
      } catch (err) {
        console.log(err);
      }
    }
    await writeFile(outPath, fileStr);
  } catch (err) {
    console.log(err);
  }
})();
