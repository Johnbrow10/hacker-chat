import Events from "events";
import terminalController from "./src/terminalController.js";

const componentEmitter = new Events();

const controller = new terminalController();
await controller.initializeTable(componentEmitter);
