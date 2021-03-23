/*
 */
import Events from "events";
import CliConfig from "./src/cliConfig.js";
import terminalController from "./src/terminalController.js";

const [nodePath, filePath, ...commands] = process.argv;

const config = CliConfig.parseArguments(commands);

console.log("config", config);

const componentEmitter = new Events();

// const controller = new terminalController();
// await controller.initializeTable(componentEmitter);
