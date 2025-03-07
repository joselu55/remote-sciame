const loginForm = document.getElementById("login-form");

function userloginOK() {
    window.location.replace("/control");
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("/authentication", {
        method: "GET"
    }).then((res) => {
        if (res.ok) {
            userloginOK();
        } else {
            console.log("there is no active session...")
        }
    })
})

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const loginData = new FormData(loginForm);

    fetch("/authentication", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: loginData.get("username"),
            password: loginData.get("password")
        })
    }).then((res) => {
        if (res.ok) userloginOK();;
    })
})