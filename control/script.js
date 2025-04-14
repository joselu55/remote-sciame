const moduleForm = document.querySelector("form");
const onlineDisplay = document.getElementById("online-display");
const closedDoorDisplay = document.getElementById("closed-door-display");
const openRequestDisplay = document.getElementById("open-request-display");
const lockSwitch = document.querySelector("lock-switch");

let modules, ws;

lockSwitch.addEventListener("click", () => {
    const willBeSent = 
        onlineDisplay.getValue() &&
        closedDoorDisplay.getValue() &&
        openRequestDisplay.getValue()
    ;

    if (!willBeSent) return;

    modules["pedrito"].state = "SWITCHING";
    updateUI();

    ws.send(JSON.stringify({
        subject: "update",
        modules: modules,
    }))

});

function updateUI() {
    console.log("new data: ", modules);

    const online = modules["pedrito"].online;
    const closedDoor = modules["pedrito"].closedDoor;
    const openRequest = modules["pedrito"].openRequest;
    const state = modules["pedrito"].state;

    if (online) onlineDisplay.setTrue();
    else onlineDisplay.setFalse();

    if (closedDoor) closedDoorDisplay.setTrue();
    else closedDoorDisplay.setFalse();

    if (openRequest) openRequestDisplay.setTrue();
    else openRequestDisplay.setFalse();

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
        console.log("new message: ", data);
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
  
