const moduleForm = document.querySelector("form");
const connectionStatus = moduleForm.querySelector("connection-status");
const lockSwitch = moduleForm.querySelector("lock-switch");

let modules, ws;

lockSwitch.addEventListener("click", () => {
    modules["pedrito"].state = "SWITCHING";
    updateUI();

    ws.send(JSON.stringify({
        subject: "update",
        modules: modules,
    }))
});

function updateUI() {
    const online = modules["pedrito"].online;
    const state = modules["pedrito"].state;
    if (online) connectionStatus.setOnline();
    if (state != null) {
        if (state == "UNDEFINED") lockSwitch.setUndefined();
        else if (state == "SWITCHING") lockSwitch.setSwitching();
        else if (state == "LOCKED") lockSwitch.setLocked();
        else if (state == "UNLOCKED") lockSwitch.setUnlocked();
    } else lockSwitch.setUndefined();
}

function connectWebSocket() {
    ws = new WebSocket("/rtc/users");

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
  
