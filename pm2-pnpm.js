const { execSync } = require("child_process");

const [ignore, ignore2, ...args] = process.argv;

execSync(`pnpm ${args.join(" ")}`, { windowsHide: true, stdio: "inherit" });
