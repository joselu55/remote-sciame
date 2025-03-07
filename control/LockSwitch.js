class LockSwitch extends HTMLElement {
    constructor() {
        super();
    }

    resetClassList() {
        this.classList.remove("unlocked");
        this.classList.remove("dead");
        this.classList.remove("locked");
        this.classList.remove("switching");
    }

    setLocked() {
        this.textContent = "Locked";
        this.resetClassList();
        this.classList.add("locked");
    }

    setUnlocked() {
        this.textContent = "Unlocked";
        this.resetClassList();
        this.classList.add("unlocked");
    }

    setSwitching() {
        this.textContent = "Switching";
        this.resetClassList();
        this.classList.add("switching");
    }

    setDead() {
        this.textContent = "Dead";
        this.resetClassList();
        this.classList.add("dead");
    }

    connectedCallback() {
        this.setDead();
    }

    disconnectedCallback() {
        this.remove();
    }
}

customElements.define("lock-switch", LockSwitch)