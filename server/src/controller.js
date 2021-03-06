import { constants } from "./constants.js";

export default class Controller {
  #users = new Map();
  #rooms = new Map();
  constructor({ socketServer }) {
    this.socketServer = socketServer;
  }

  onNewConnection(socket) {
    const { id } = socket;
    console.log("connection stablished with", id);
    const userData = { id, socket };
    this.#updateGlobalUserData(id, userData);

    socket.on("data", this.#onSocketData(id));
    socket.on("error", this.#onSocketClosed(id));
    socket.on("end", this.#onSocketClosed(id));
  }
  async joinRoom(socketId, data) {
    const userData = data;
    console.log(`${userData.userName} joined! ${socketId}`);
    const { roomId } = userData;
    const user = this.#updateGlobalUserData(socketId, userData);
    const users = this.#joinUserRoom(roomId, user);

    // retornando apenas os usuarios ativos
    const currentUsers = Array.from(users.values()).map(({ id, userName }) => ({
      userName,
      id,
    }));

    /* Atualiza o usuario que conectou sobre quais usuarios ja estao conectados na mesma sala!! */
    this.socketServer.sendMessage(
      user.socket,
      constants.event.UPDATE_USERS,
      currentUsers
    );

    // Avisa a rede se um usuario novo se conectou-se
    this.broadCast({
      socketId,
      roomId,
      message: { id: socketId, userName: userData.userName },
      event: constants.event.NEW_USER_CONNECTED,
    });
  }

  broadCast({
    socketId,
    event,
    message,
    roomId,
    includeCurrentSocket = false,
  }) {
    const usersOnRoom = this.#rooms.get(roomId);

    for (const [key, user] of usersOnRoom) {
      if (!includeCurrentSocket && key === socketId) continue;

      this.socketServer.sendMessage(user.socket, event, message);
    }
  }

  message(socketId, data) {
    // capturar o roomId para poder o usuario mandar mensagem apenas para alguem na mesma sala
    const { userName, roomId } = this.#users.get(socketId);

    this.broadCast({
      roomId,
      socketId,
      event: constants.event.MESSAGE,
      message: { userName, message: data },
      // a mensagem encaminhada para o servidor e a mensagem sera repassada se o usuario estiver online
      includeCurrentSocket: true,
    });
  }

  #joinUserRoom(roomId, user) {
    const usersOnRoom = this.#rooms.get(roomId) ?? new Map();
    usersOnRoom.set(user.id, user);
    this.#rooms.set(roomId, usersOnRoom);

    return usersOnRoom;
  }

  #onSocketData(id) {
    return (data) => {
      try {
        const { event, message } = JSON.parse(data);
        this[event](id, message);
      } catch (error) {
        console.error("Wrong event format", data.toString());
      }
    };
  }

  #logoutUser(id, roomId) {
    // deleta o usuario da sala
    this.#users.delete(id);
    const usersOnRoom = this.#rooms.get(roomId);
    usersOnRoom.delete(id);

    // e atualizou a sala que o usuario saiu dela
    this.#rooms.set(roomId, usersOnRoom);
  }

  #onSocketClosed(id) {
    return (_) => {
      const { userName, roomId } = this.#users.get(id);
      console.log(userName, "disconnected", id);
      this.#logoutUser(id, roomId);
      // para comunicar a rede que o usuario foi disconectado

      this.broadCast({
        roomId,
        message: { id, userName },
        socketId: id,
        event: constants.event.DISCONNECT_USER,
      });
    };
  }

  #updateGlobalUserData(socketId, userData) {
    const users = this.#users;
    const user = users.get(socketId) ?? {};

    const updateUserData = {
      ...user,
      ...userData,
    };

    users.set(socketId, updateUserData);

    return users.get(socketId);
  }
}
