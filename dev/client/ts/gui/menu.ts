import GUIElement from "./guielement";

export default class Menu extends GUIElement {
    private $menu: HTMLElement;

    constructor() {
        super();
        document.getElementById('main').appendChild(this);
        this.render();

        this.querySelector('.burger').addEventListener('click', (e) => this.burgerClickHandler(e));
        this.$menu = this.querySelector('.navbar-menu');
    }

    render(): void {
        this.innerHTML = `
            <nav class="navbar" role="navigation" aria-label="main navigation">
                <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbar">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
                <div id="navbar" class="navbar-menu">
                    <div class="navbar-start">
                        <a class="navbar-item">My Catches</a>
                        <a class="navbar-item">Settings</a>
                        <a class="navbar-item">About</a>
                    </div>
                </div>
            </nav>
        `;
        this.renderDone();
    }

    /**
     * @TODO Implement multilingual components from previous project for copy files
     */
    renderDone(): void {
    }

    /**
     * @param e
     */
    private burgerClickHandler(e: Event) {
        let $target = (e.target as HTMLElement);
        if ($target.classList.contains('is-active')) {
            $target.classList.remove('is-active');
            this.$menu.classList.remove('is-active');
        } else {
            $target.classList.add('is-active');
            this.$menu.classList.add('is-active');
        }
    }
}

window.customElements.define('cp-menu', Menu);
