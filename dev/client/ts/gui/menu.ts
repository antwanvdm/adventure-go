import GUIElement from './guielement';

export default class Menu extends GUIElement {
  private burger: HTMLElement;
  private menu: HTMLElement;

  constructor ()
  {
    super();
    document.getElementById('main').appendChild(this);
    this.render();

    this.menu = this.querySelector('.navbar-menu');
    this.burger = this.querySelector('.burger');
    this.burger.addEventListener('click', () => this.burgerClickHandler());
  }

  render (): void
  {
    this.innerHTML = `
            <nav class="navbar" role="navigation" aria-label="main navigation">
                <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbar">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
                <div id="navbar" class="navbar-menu">
                    <div class="navbar-start">
                        <a class="navbar-item" data-ml data-ml-key="menu1"></a>
                        <a class="navbar-item" data-ml data-ml-key="menu2"></a>
                        <a class="navbar-item" data-ml data-ml-key="menu3"></a>
                        <a href="/auth/twitter" class="navbar-item" data-ml data-ml-key="menu4"></a>
                    </div>
                </div>
            </nav>
        `;
    this.renderDone();
  }

  renderDone (): void
  {
    setTimeout(() => {
      this.renderProperties();
    }, 0);
  }

  private burgerClickHandler ()
  {
    if (this.burger.classList.contains('is-active')) {
      this.burger.classList.remove('is-active');
      this.menu.classList.remove('is-active');
    } else {
      this.burger.classList.add('is-active');
      this.menu.classList.add('is-active');
    }
  }
}

window.customElements.define('cp-menu', Menu);
