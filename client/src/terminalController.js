import componentsBuilder from "./components.js";

export default class terminalController {
  contructor() {}

  #onInputReceived(eventEmitter) {
    return function () {
      const message = this.getValue();
      console.log(message);
      this.clearValue();
    };
  }

  initializeTable(eventEmitter) {
    const components = new componentsBuilder()
      // inicalizou o screen com o titulo na tela
      .setScreen({
        title: " HackerChat - Johnatan Dos Santos ",
      })
      // seta o layout component
      .setInputComponent()
      //   e o input components aceita receber o evento emitido
      .setInputComponent(this.#onInputReceived(eventEmitter))
      .build();

    components.input.focus();
    components.screen.render();
  }
}
