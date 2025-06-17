import { css, html, LitElement } from "lit";
import { customElement, property, query, queryAssignedElements } from "lit/decorators.js";


@customElement("sn-img")
export class SNImg extends LitElement {
  static styles = [
    css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      aspect-ratio: inherit;
    }
    
    ::slotted(img), ::slotted(picture) {
      will-change: opacity;
      transition: opacity 500ms ease-in-out;
      opacity: 0;
      width: 100%;
      height: 100%;
    }
    .img-background {
      height: 100%;
        position: relative;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        background-clip: border-box;
      }

      .img-background::before {
        content: "";
        inset: 0;
        position: absolute;
        will-change: opacity;
        transition: opacity 200ms ease-in-out;
        animation: pulse 2.5s infinite alternate;
        backdrop-filter: blur(5px);
      }

      .img-background.loaded::before {
        animation: none;
        content: none;
      }

      .img-background.loaded ::slotted(*) {
        opacity: 1;
      }

      :host {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        line-height: 0;
        position: relative;
      }

      @keyframes pulse {
        0% {
          background-color: rgba(255, 255, 255, 0.2);
        }

        50% {
          background-color: rgba(255, 255, 255, 0.4);
        }

        100% {
          background-color: rgba(255, 255, 255, 0.2);
        }
      }
    `,
  ];

  @property({ reflect: true })
  placeholder?: string;

  @query(".img-background")
  private _imgBackground?: HTMLDivElement;

  @queryAssignedElements()
  private _slottedElements!: NodeListOf<HTMLImageElement | HTMLPictureElement>;

  protected firstUpdated(): void {
    if (this._slottedElements.length === 0) return;

    const slottedElement = this._slottedElements[0];
    let  slottedImage!: HTMLImageElement;

    if (slottedElement instanceof HTMLPictureElement) {
      slottedImage = slottedElement.querySelector('img') as HTMLImageElement;
    }
    else {
      slottedImage = slottedElement;
    }

    if (slottedImage.complete) {
      this._imageLoaded();
    } else {
      slottedImage.addEventListener("load", () => {
        this._imageLoaded();
      });
    }
  }

  private _imageLoaded(): void {
    this._imgBackground?.classList.add("loaded");
  }

  protected render() {
    return html`
      <div
      part="img-container"
        class="img-background"
        style=${`background-color: gray; background-image: url(${this.placeholder}); `}
      >
        <slot></slot>
      </div>
    `;
  }
}
