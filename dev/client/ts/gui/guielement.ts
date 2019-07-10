export default abstract class GUIElement extends HTMLElement {
    protected constructor() {
        super();
        this.render();
    }

    abstract render(): void;

    abstract renderDone(): void;
}
