import Translator from "../helpers/translator";

export default abstract class GUIElement extends HTMLElement {
    protected constructor() {
        super();
        this.render();
        window.addEventListener('translator:languageChange', () => this.renderProperties());
    }

    protected renderProperties(): void {
        [...this.querySelectorAll('[data-ml]')].forEach(($childElement) => {
            let dataML = $childElement.getAttribute('data-ml');
            let translateString = Translator.i().t($childElement.getAttribute('data-ml-key'));

            if (dataML === "") {
                $childElement.innerHTML = translateString;
            } else {
                $childElement.setAttribute(dataML, translateString);
            }
        });
    }

    abstract render(): void;

    abstract renderDone(): void;
}
