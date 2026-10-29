const net = require("net");
const concurrently = require("concurrently");

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findAvailablePort() {
  const configuredPort = Number(process.env.SAC_API_PORT || process.env.PORT);
  const firstPort = Number.isInteger(configuredPort) && configuredPort >= 1024 && configuredPort <= 65535
    ? configuredPort
    : 3001;

  for (let port = firstPort; port <= Math.min(firstPort + 99, 65535); port += 1) {
    if (await isPortAvailable(port)) return port;
  }

  throw new Error(`No se encontró un puerto libre para la API desde ${firstPort}.`);
}

async function startDevelopmentServers() {
  const apiPort = await findAvailablePort();
  const result = concurrently([
    {
      command: "npm run dev:backend",
      name: "API",
      env: { SAC_API_PORT: String(apiPort) },
    },
    {
      command: "npm run dev:frontend",
      name: "WEB",
      env: { SAC_API_PORT: String(apiPort) },
    },
  ], {
    killOthersOn: ["success", "failure"],
    prefix: "name",
    prefixColors: ["blue", "green"],
  });

  result.result.catch((error) => {
    console.error("No se pudieron mantener los servidores de desarrollo.", error);
    process.exitCode = 1;
  });
}

startDevelopmentServers().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
