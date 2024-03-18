import * as ws from "./webSocketConnection.js";
import * as speechRecognition from "./speechRecognition.js";
import * as synthetizer from "./speechSynthesis.js";

speechRecognition.enable_debug();
speechRecognition.init_speech_recognition();
let is_speaking = false;

let speech_random = (x, y) => {
  const coreModel = currentModel.internalModel.coreModel;
  console.log("speech", x, y);
  if (is_speaking) {
    mover_boca(2, Math.random());
    setTimeout(() => {
      speech_random(x, y);
    }, 100);
  } else {
    mover_boca(2, 0);
  }
};

synthetizer.set_onEnd_synthetizer(() => {
  is_speaking = false;
  buttonRecognition.disabled = false;
  console.log("El audio sintetizado ha terminado");
});

const recognition_process = (data) => {
  //nuevo
  //const chatBox = document.querySelector(".ChatBox");
  const chatBox = document.querySelector(
    `.ChatBox[class*="${window.actualTab}"]`
  );

  // Eliminar elemento TextDetection si existe
  const textDetectionElement = document.getElementById(`TextDetection${window.actualTab}`);
  if (textDetectionElement) {
    textDetectionElement.remove();
  }

  // Eliminar elemento GPTAnswer si existe
  const gptAnswerElement = document.getElementById(`GPTAnswer${window.actualTab}`);
  if (gptAnswerElement) {
    gptAnswerElement.remove();
  }

  const userMessageDiv = document.createElement("div");
  userMessageDiv.classList.add("Message", "UserMessage");
  userMessageDiv.innerHTML = `<div class="MessageContent">${data}</div>`;
  chatBox.appendChild(userMessageDiv);

  stop_recognition();
  console.log("El usuario tiene el tab: ", window.actualTab);
  ws.send({ action: "answerChat", message: data, tab: window.actualTab });
};

let process_message = (message) => {
  let process_message = JSON.parse(message);
  if (process_message.action == "gpt_answer") {
    synthetizer.change_pitch(1.5);
    //nuevo
    //onst chatBox = document.querySelector(".ChatBox");
    const chatBox = document.querySelector(
      `.ChatBox[class*="${window.actualTab}"]`
    );

    const gptMessageDiv = document.createElement("div");
    gptMessageDiv.classList.add("Message", "GptMessage");
    gptMessageDiv.innerHTML = `<div class="MessageContent">${process_message.message}</div>`;
    chatBox.appendChild(gptMessageDiv);

    synthetizer.say(process_message.message);
    is_speaking = true;
    speech_random(0, 0);
  }
};

ws.set_websocket_message_processing_function(process_message);

let recognition_started = false;
let mouse_hover = true;
let buttonRecognition = document.getElementById("BeginRecognition");

let stop_recognition = () => {
  speechRecognition.stop_recognition();
  buttonRecognition.innerHTML = `<span>Comience a hablar</span>`;
  recognition_started = false;
  buttonRecognition.disabled = true;
};

buttonRecognition.onmousedown = () => {
  if (!recognition_started) {
    speechRecognition.start_recognition();
    recognition_started = true;
    buttonRecognition.innerHTML = `<span>Procesando</span>`;
  } else {
    stop_recognition();
  }
};

buttonRecognition.onmouseup = (e) => {
  if (mouse_hover) {
    stop_recognition();
  } else {
  }
};

document.body.onmousemove = (e) => {
  let x = e.clientX;
  let y = e.clientY;
  let bounding = buttonRecognition.getBoundingClientRect();
  if (
    bounding.x < x &&
    bounding.x + bounding.width > x &&
    bounding.y < y &&
    bounding.y + bounding.height > y
  ) {
    mouse_hover = true;
  } else {
    mouse_hover = false;
  }
};

speechRecognition.set_process_recognition(recognition_process);

const tabBackgrounds = {
  "Entretenimiento": "url('../image/c9p7mmhmjudz.png')",
  "Deportes": "url('../image/sports-for-health-conference-2022.jpg')",
  "Música": "url('../image/musica.jpg')",
  "Historia": "url('../image/historia.jpg')"
};

const buttonBehavior = true;
export default buttonBehavior;

const tabButtons = document.querySelectorAll(".tab-btn");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Elimina la clase 'active' de todos los botones
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    // Agrega la clase 'active' al botón clickeado
    button.classList.add("active");
    //obtiene el mensaje del span del button
    const message = button.innerText;
    window.actualTab = message;
    console.log("El tab se ha cambiado a: ", window.actualTab);

    const newBackgroundImage = tabBackgrounds[message];
    document.querySelector('.container').style.backgroundImage = newBackgroundImage;
    // Obtiene el chatbox actual y el nuevo
    const currentChatBox = document.querySelector(".ChatBox:not(.Oculto)");
    const newChatBox = document.querySelector(
      `.ChatBox[class*="${window.actualTab}"]`
    );

    // Muestra el nuevo chatbox y oculta el actual
    currentChatBox.classList.add("Oculto");
    newChatBox.classList.remove("Oculto");
  });
});
