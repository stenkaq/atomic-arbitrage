import { bootstrap } from "./src/infrastucture/bootstrap.js";

process.on("uncaughtException", (err) => {
  console.error("[Fatal] uncaughtException", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[Fatal] unhandledRejection", reason);
  process.exit(1);
});

console.log("[Startup] bootstrapping...");
bootstrap()
  .then(() => console.log("[startup] running"))
  .catch((err) => {
    console.error("[startup] bootstrap failed", err);
    process.exit(1);
  });
