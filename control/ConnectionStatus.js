class ConnectionStatus extends HTMLElement {
    constructor() {
        super();
    }

    setOnline() {
        this.textContent = "Online";
        this.style.backgroundColor = "var(--color-success)";
    }

    setOffline() {
        this.textContent = "Offline";
        this.style.backgroundColor = "var(--color-disable)";
    }

    connectedCallback() {
        this.setOffline();
    }

    disconnectedCallback() {
        this.remove();
    }
}

customElements.define("connection-status", ConnectionStatus)