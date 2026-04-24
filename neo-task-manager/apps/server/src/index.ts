import { createServer } from "./server/create-server.js";

const bootstrap = async () => {
  const { appServer, config } = await createServer();
  appServer.listen(config.port, () => {
    console.log(`neoTaskManager server listening on ${config.port}`);
  });
};

bootstrap().catch((error) => {
  console.error("Server bootstrap failed", error);
  process.exit(1);
});

