class BooleanDisplay extends HTMLElement {
    #value = false;

    constructor() {
        super();
    }

    setTrue() {
        this.#value = true;
        this.textContent = "True";
        this.style.color = "black";
        this.style.backgroundColor = "var(--color-success)";
    }

    setFalse() {
        this.#value = false;
        this.textContent = "False";
        this.style.color = "white";
        this.style.backgroundColor = "var(--color-danger)";
    }

    getValue() {
        return this.#value;
    }

    connectedCallback() {
        this.setFalse();
    }

    disconnectedCallback() {
        this.remove();
    }
}

customElements.define("boolean-display", BooleanDisplay)