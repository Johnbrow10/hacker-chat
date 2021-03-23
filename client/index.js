/*
 */
import Events from "events";
import CliConfig from "./src/cliConfig.js";
import SocketClient from "./src/socket.js";
import terminalController from "./src/terminalController.js";

const [nodePath, filePath, ...commands] = process.argv;
const config = CliConfig.parseArguments(commands);

const componentEmitter = new Events();
const socketClient = new SocketClient(config);

await socketClient.initialize();

// const controller = new terminalController();
// await controller.initializeTable(componentEmitter);
