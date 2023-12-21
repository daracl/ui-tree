import utils from "./utils";

type ElementType = Element | string | NodeList | Document | null | undefined;

export default {
  /**
   * @method getItemVal
   * @param itemEle {Element} value를 구할 element
   * @description value 구하기.
   */
  before(el: ElementType, renderElements: Element | string) {
    insertAdjacentHTML($querySelector(el), "beforebegin", renderElements);
  },
  after(el: ElementType, renderElements: Element | string) {
    insertAdjacentHTML($querySelector(el), "afterend", renderElements);
  },
  prepend(el: ElementType, renderElements: Element | string) {
    insertAdjacentHTML($querySelector(el), "afterbegin", renderElements);
  },
  append(el: ElementType, renderElements: Element | string) {
    insertAdjacentHTML($querySelector(el), "beforeend", renderElements);
  },
  empty(el: ElementType, html?: string) {
    if (el == null) return el;

    $querySelector(el).forEach((el1) => {
      el1.replaceChildren();

      if (html) {
        el1.innerHTML = html;
      }
    });
  },
  hasClass(el: ElementType, styleClassName: string) {
    for (let el1 of $querySelector(el)) {
      if (el1.classList.contains(styleClassName)) {
        return true;
      }
    }

    return false;
  },

  toggleClass(el: ElementType, styleClassName: string) {
    if (el == null) return;

    for (let el1 of $querySelector(el)) {
      const classList = el1.classList;
      if (classList.contains(styleClassName)) {
        classList.remove(styleClassName);
      } else {
        classList.add(styleClassName);
      }
    }
  },

  addClass(el: ElementType, styleClassName: string) {
    if (!el) return el;

    const classNames = styleClassName.replaceAll(/\s+/g, " ").split(" ");

    $querySelector(el).forEach((el1) => {
      let classList = el1.classList;
      for (let className of classNames) {
        if (!classList.contains(className)) {
          classList.add(className);
        }
      }
    });
  },
  removeClass(el: ElementType, styleClassName: string) {
    if (el == null) return el;

    const classNames = styleClassName.replaceAll(/\s+/g, " ").split(" ");
    for (let className of classNames) {
      $querySelector(el).forEach((el1) => {
        el1.classList.remove(className);
      });
    }
  },
  htmlToText(htmlText: string): string {
    let divEle = document.createElement("div");
    divEle.innerHTML = htmlText;
    return divEle.innerText;
  },

  isInputField(tagName: string): boolean {
    return tagName.search(/(input|select|textarea)/i) > -1;
  },

  setAttribute(el: Element, attrs: any) {
    for (let key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  },

  getWinScrollTop(): number {
    return window.pageYOffset || document.documentElement.scrollTop;
  },
};

function $querySelector(el: ElementType): any[] {
  if (!el) [];

  if (el instanceof Document) {
    return [document];
  }

  if (el instanceof Element) {
    return [el];
  }
  let nodeList;
  if (el instanceof NodeList) {
    nodeList = el;
  } else if (typeof el === "string") {
    nodeList = document.querySelectorAll(el);
  }

  if (nodeList) {
    const reval: Element[] = [];

    for (let node of nodeList) {
      reval.push(node as Element);
    }

    return reval;
  }

  return [];
}

function insertAdjacentHTML(elements: Element[], insertPosition: InsertPosition, renderElements: Element | string) {
  if (utils.isString(renderElements)) {
    elements.forEach((el) => {
      el.insertAdjacentHTML(insertPosition, renderElements);
    });
  } else {
    elements.forEach((el) => {
      el.insertAdjacentElement(insertPosition, renderElements);
    });
  }
}
