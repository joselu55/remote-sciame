import express from "express";
import expressWs from "express-ws";
import cookieParser from "cookie-parser";

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

let modules = {
    "pedrito": {
        token: "kiikj34ij3i4o3k4jo03f0o3f340fkf4330",
        online: true,
        functions: {
            doorLock: {
                locked: false,
            }
        }
    }
}

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

app.use('/control', authCheckMiddle, express.static('control'));


app.ws("/rtc", (ws, req) => {
    const user = authCheck(req);

    if (user) {
        console.log("New real time connection request from: ", user);

        ws.send(JSON.stringify({
            subject: "update",
            modules: modules
        }));

        ws.on("message", msg => {
            const data = JSON.parse(msg);
            modules = data.modules;
        })

        ws.on("close", () => {
            console.log(`connection with ${user} ended!!`)
        })
    } else {
        ws.close(1008, "");
        return;
    }

})

app.listen(
    PORT,
    () => {
        console.log(`Server listen at http://localhost:${PORT}`)
    },
)