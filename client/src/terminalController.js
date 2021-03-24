import componentsBuilder from "./components.js";
import { constants } from "./constants.js";

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
      eventEmitter.emit(constants.events.app.MESSAGE_SENT, message);
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
      // sempre left para sair e join para entrar
      const [userName] = msg.split(/\s/);
      const collor = this.#getUserCollor(userName);

      activityLog.addItem(`{${collor}}{bold}: ${msg.toString()}{/}`);

      screen.render();
    };
  }

  #onStatusChanged({ screen, status }) {
    return (users) => {
      //   pegar o primeiro elemento da lista
      const { content } = status.items.shift();
      status.clearItems();
      status.addItem(content);

      users.forEach((userName) => {
        const collor = this.#getUserCollor(userName);
        status.addItem(`{${collor}}{bold}${userName}{/}`);
      });

      screen.render();
    };
  }

  #registerEvents(eventEmitter, components) {
    eventEmitter.on(
      constants.events.app.MESSAGE_RECEIVED,
      this.#onMessageReceived(components)
    );
    eventEmitter.on(
      constants.events.app.ACTIVITYLOG_UPDATED,
      this.#onLogChanged(components)
    );
    eventEmitter.on(
      constants.events.app.STATUS_UPDATED,
      this.#onStatusChanged(components)
    );
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
  }
}
