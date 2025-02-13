module.exports = {
  apps : [{
    name: "scrapper",
    script: "pm2-pnpm.js",
    cwd: "./",
    args: "run start"
  }]
};
