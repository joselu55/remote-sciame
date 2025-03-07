const moduleForm = document.querySelector("form");
const connectionStatus = moduleForm.querySelector("connection-status");
const lockSwitch = moduleForm.querySelector("lock-switch");

let modules, ws;

lockSwitch.addEventListener("click", () => {
    modules["pedrito"].functions.doorLock.locked = null;
    updateUI();

    ws.send(JSON.stringify({
        subject: "update",
        modules: modules,
    }))
});

function updateUI() {
    const online = modules["pedrito"].online;
    const locked = modules["pedrito"].functions.doorLock.locked;
    if (online) connectionStatus.setOnline();
    if (locked != null) {
        if (locked) lockSwitch.setLocked();
        else lockSwitch.setUnlocked();
    } else lockSwitch.setSwitching();
}

function connectWebSocket() {
    ws = new WebSocket("/rtc");

    ws.addEventListener("open", () => {
        console.log("Conexión establecida");
        moduleForm.classList.remove("disabled")
    });

    ws.addEventListener("message", (event) => {
        console.log("Mensaje recibido!!");
        const data = JSON.parse(event.data);
        modules = data.modules;
        updateUI();
    });

    ws.addEventListener("error", (err) => {
        console.error("Error en el WebSocket:", err);

        ws.close();
    });

    ws.addEventListener("close", (e) => {
        moduleForm.classList.add("disabled")
        if (e.code == 1008) {
            window.location.replace("/");
        }
        console.log("Connection closed, trying to reconnect...");
        setTimeout(() => {
            connectWebSocket();
        }, 3000);
    });
}
  
connectWebSocket();
  
