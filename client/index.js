#!/usr/bin/env node

/* 
    chmod +x index.js
 */

/* 
npm i -g @johnbrow/chat-hacker-client

npm unlink -g @johnbrow/chat-hacker-client
./index.js \
       --username johnbrow \
       --room sala01

    ./index.js \
       --username johnbrow \
       --room sala01

    node index.js \
    --username johnbrow\
    --room sala01 \
    --hostUri localhost

  */
import Events from "events";
import CliConfig from "./src/cliConfig.js";
import EventManager from "./src/eventManager.js";
import SocketClient from "./src/socket.js";
import terminalController from "./src/terminalController.js";

const [nodePath, filePath, ...commands] = process.argv;
const config = CliConfig.parseArguments(commands);

const componentEmitter = new Events();
const socketClient = new SocketClient(config);

await socketClient.initialize();
const eventManager = new EventManager({ componentEmitter, socketClient });
const events = eventManager.getEvents();
socketClient.attachEvents(events);

const data = {
  roomId: config.room,
  userName: config.username,
};

eventManager.joinRoomAndWaitForMessages(data);

const controller = new terminalController();
await controller.initializeTable(componentEmitter);
