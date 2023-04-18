const fs = require("fs");
const path = require("path");

const source = path.join(process.cwd(), "README.md");
const dest = path.join(process.cwd(), "dist", "README.md");

fs.copyFile(source, dest, (err) => {
  if (err) throw err;
  console.log(`${source} was copied to ${dest}`);
});
