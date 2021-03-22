import blessed from "blessed";

export default class componentsBuilder {
  constructor() {}

  #screen;
  #layout;
  #input;
  #chat;
  #status;
  #activityLog;

  #baseComponent() {
    return {
      border: "line",
      mouse: true,
      keys: true,
      top: 0,
      scrollBoar: {
        ch: " ",
        //   e para inverter o jeito que a pagina desliza quando o scroll e ativado que nem no mac
        inverse: true,
      },
      // Habilita customização de tags do html com as cores no texto
      tags: true,
    };
  }
  setScreen({ title }) {
    this.#screen = blessed.screen({
      smartCSR: true,
      title,
    });

    // para fechar a tela ou o programa no console digita tais teclas
    this.#screen.key(["escape", "q", "C-c"], () => process.exit(0));

    return this;
  }

  setLayoutComponent() {
    this.#layout = blessed.layout({
      parent: this.#screen,
      width: "100%",
      height: "100%",
    });
    return this;
  }

  setInputComponent(onEnterPressed) {
    const input = blessed.textarea({
      parent: this.#screen,
      bottom: 0,
      height: "10%",
      inputOnFocus: true,
      padding: {
        top: 1,
        left: 2,
      },
      style: {
        fg: "#f6f6f6",
        bg: "#353535",
      },
    });

    input.key("enter", onEnterPressed);
    this.#input = input;

    return this;
  }

  setChatComponent() {
    this.#chat = blessed.list({
      ...this.#baseComponent(),
      parent: this.#layout,
      align: "left",
      width: "50%",
      height: "90%",
      items: ["{bold}Messenger{/}"],
    });
    return this;
  }

  setStatusComponent() {
    this.#status = blessed.list({
      ...this.#baseComponent(),
      parent: this.#layout,
      width: "25%",
      height: "90%",
      items: ["{bold}Users on Room{/}"],
    });
    return this;
  }

  setActivityLogComponent() {
    this.#activityLog = blessed.list({
      ...this.#baseComponent(),
      parent: this.#layout,
      width: "25%",
      height: "90%",
      style: {
        fg: "yellow",
      },
      items: ["{bold}Activity Log{/}"],
    });
    return this;
  }

  build() {
    const components = {
      screen: this.#screen,
      input: this.#input,
      chat: this.#chat,
      activityLog: this.#activityLog,
      status: this.#status,
    };

    return components;
  }
}
