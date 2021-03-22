import componentsBuilder from "./components.js";

export default class terminalController {
  #userCollors = new Map();

  contructor() {}

  #pickCollor() {
    // Numero ramdomico para gerar varias cores aleatorias
    return `#` + (((1 << 24) * Math.random()) | 0).toString(16) + `-fg`;
  }
  #getUserCollor(userName) {
    if (this.#userCollors.has(userName)) return this.#userCollors.get(userName);
    const collor = this.#pickCollor();
    this.#userCollors.set(userName, collor);
    return collor;
  }

  #onInputReceived(eventEmitter) {
    return function () {
      const message = this.getValue();
      console.log(message);
      this.clearValue();
    };
  }

  #onMessageReceived({ screen, chat }) {
    return (msg) => {
      const { userName, message } = msg;
      const collor = this.#getUserCollor(userName);

      chat.addItem(`{${collor}}{bold}: ${userName}{/}: ${message}`);
      screen.render();
    };
  }

  #onLogChanged({ screen, activityLog }) {
    return (msg) => {
      //

      const [userName] = msg.split(/\s/);
      const collor = this.#getUserCollor(userName);

      activityLog.addItem(`{${collor}}{bold}: ${msg.toString()}{/}`);

      screen.render();
    };
  }

  #registerEvents(eventEmitter, components) {
    eventEmitter.on("message:received", this.#onMessageReceived(components));
    eventEmitter.on("activityLog:updated", this.#onLogChanged(components));
  }

  async initializeTable(eventEmitter) {
    const components = new componentsBuilder()
      // inicalizou o screen com o titulo na tela
      .setScreen({
        title: " HackerChat - Johnatan Dos Santos ",
      })
      // seta o layout component
      .setLayoutComponent()
      .setInputComponent(this.#onInputReceived(eventEmitter))
      .setChatComponent()
      .setActivityLogComponent()
      .setStatusComponent()

      .build();

    this.#registerEvents(eventEmitter, components);
    components.input.focus();
    components.screen.render();
    setInterval(() => {
      //   eventEmitter.emit("message:received", {
      //     message: "salve quebrada",
      //     userName: "Johnbrow",
      //   });
      //   eventEmitter.emit("message:received", {
      //     message: "ta salvado",
      //     userName: "livian",
      //   });

      eventEmitter.emit("activityLog:updated", "Johnbrow left");
      eventEmitter.emit("activityLog:updated", "livian join");
    }, 1000);
  }
}
