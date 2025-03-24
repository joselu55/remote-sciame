const express = require("express");
const expressWs = require("express-ws");
const cookieParser = require("cookie-parser");

const PORT = 8080;
const app = express();

app.use(express.json())
app.use(cookieParser())
expressWs(app);

const users = {
    "javi": {
        password: "javi",
        sessions: [
            {
                token: "8jt50j324589fg04sd509hj02kfn09243",
                lifeEnd: 3003679036
            }
        ]
    },
    "jl": {
        password: "paco",
        sessions: [
            {
                token: "asddv45y6h5656655dfh5hh5565ynh67jf",
                lifeEnd: 3003679036
            }
        ]
    }
};

const rtcConnections = [];

let STATE_KEYS = ["UNDEFINED", "SWITCHING", "LOCKED", "UNLOCKED"];

let modules = {
    "pedrito": {
        key: "PdM4jBdLYKh8qX25fcLPlWCQ",
        online: false,
        state: STATE_KEYS[0]
    }
}

const rtcModulesConnections = {};

function findUserByToken(token) {
    for (const username in users) {
      const user = users[username];
      const session = user.sessions.find(s => s.token === token);
      if (session) {
        return { username, session };
      }
    }
    return null;
  }

app.use(express.static("public"))

app.post("/authentication", (req, res) => {
    console.log("authentication request from: ", req.ip)
    const data = req.body;
    const userData = users[data.username]
    if (userData) {
        if (userData.password == data.password) {
            const token = userData.sessions[0].token
            res.cookie('sessionToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 5 * 60 * 1000
            });
            res.status(200);
            res.send("Authentication successful!!");
            return;
        }
    }
    res.sendStatus(401);
});

function authCheck(req) {
    const sessionToken = req.cookies.sessionToken;
    const userSession = findUserByToken(sessionToken);
    if (userSession) {
        return userSession.username;
    }
    return
}

function authCheckMiddle(req, res, next) {
    if (authCheck(req)) next(); 
    else {
        res.status(403);
        res.redirect("/");
    }
}

app.get("/authentication", (req, res) => {
    if (authCheck(req)) res.sendStatus(200);
    else res.sendStatus(403);
})

app.use("/control", authCheckMiddle, express.static("control"));

app.post("/module-port", (req, res) => {

});

app.ws("/rtc/users", (ws, req) => {
    const user = authCheck(req);

    if (user) {
        rtcConnections.push(ws);
        console.log("New real time connection request from: ", user);

        ws.send(JSON.stringify({
            subject: "update",
            modules: modules
        }));

        ws.on("message", msg => {
            const data = JSON.parse(msg);
            modules = data.modules;

            const i = rtcConnections.indexOf(ws);
            for (let j = 0; j < rtcConnections.length; j++) {
                if (i != j) {
                    rtcConnections[j].send(JSON.stringify({
                        subject: "update",
                        modules: modules
                    }));
                } 
            }

            console.log("trying to send update to modules...");
            if (rtcModulesConnections["pedrito"]) {
                console.log("pedrito: ");
                const currentState = modules["pedrito"].state;
                if (currentState == "SWITCHING") {
                    rtcModulesConnections["pedrito"].send("do switch");
                    console.log("   SEND OK!!");
                }
            }
        })

        ws.on("close", () => {
            console.log(`connection with ${user} ended!!`)

            const i = rtcConnections.indexOf(ws);
            if (i > -1) rtcConnections.splice(i, 1);
            
        })
    } else {
        ws.close(1008, "");
        return;
    }

});

function updateClientData() {
    for (let j = 0; j < rtcConnections.length; j++) {
        rtcConnections[j].send(JSON.stringify({
            subject: "update",
            modules: modules
        }));
    }
}

app.ws("/rtc/modules", (ws, req) => {
    let moduleID;

    ws.on("message", msg => {

        const data = msg.split("-");
        console.log(`   raw message: `, msg);
        moduleID = data[0];
        if (!rtcModulesConnections[moduleID]) rtcModulesConnections[moduleID] = ws;
        if (modules[moduleID].key != data[1]) {
            ws.close(1008, "");
            return;
        }
        modules[moduleID].state = STATE_KEYS[parseInt(data[2])];
        modules[moduleID].online = true;
        updateClientData();
    })

    ws.on("close", () => {
        console.log(`connection with ${moduleID} ended!!`)

        modules[moduleID].online = false;
        rtcModulesConnections[moduleID] = null;
        
        updateClientData();
    })
});

app.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(`Server listen at http://localhost:${PORT}`,)
    },
)