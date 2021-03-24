import Event from "events";

export default class SocketClient {
  #serverConnection = {};
  #serverListner = new Event();
  constructor({ host, port, protocol }) {
    this.port = port;
    this.host = host;
    this.protocol = protocol;
  }

  sendMessage(event, message) {
    this.#serverConnection.write(JSON.stringify({ event, message }));
  }

  attachEvents() {
    this.#serverConnection.on("data", (data) => {
      try {
        data
          .toString()
          .split("\n")
          .filter((line) => !!line)
          .map(JSON.parse)
          .map(({ event, message }) => {
            this.#serverListner.emit(event, message);
          });
      } catch (error) {
        console.log("invalid!", data.toString(), error);
      }
    });
  }

  async createConnection() {
    const options = {
      port: this.port,
      host: this.host,
      headers: {
        Connection: "Upgrade",
        Upgrade: "websocket",
      },
    };

    const http = await import(this.protocol);
    const req = http.request(options);
    req.end();

    return new Promise((resolve) => {
      req.once("upgrade", (res, socket) => resolve(socket));
    });
  }
  async initialize() {
    this.#serverConnection = await this.createConnection();
    console.log("I connected to the server!!");
  }
}
