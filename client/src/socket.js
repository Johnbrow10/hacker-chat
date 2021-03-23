export default class SocketClient {
  constructor({ host, port, protocol }) {
    this.port = port;
    this.host = host;
    this.protocol = protocol;
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
      req.once("upgrade", (res,socket)=> resolve(socket) );
    });
  }
    
}
