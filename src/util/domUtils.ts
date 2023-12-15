import utils from "./utils";

const EVENT_HANDLER_MAP = new Map();
export default {
  /**
   * @method getItemVal
   * @param itemEle {Element} value를 구할 element
   * @description value 구하기.
   */
  before(el: Element | string | NodeList, renderElements: Element | string) {
    insertAdjacentHTML($querySelector(el), "beforebegin", renderElements);
  },
  after(el: Element | string | NodeList, renderElements: Element | string) {
    insertAdjacentHTML($querySelector(el), "afterend", renderElements);
  },
  prepend(el: Element | string | NodeList, renderElements: Element | string) {
    insertAdjacentHTML($querySelector(el), "afterbegin", renderElements);
  },
  append(el: Element | string | NodeList, renderElements: Element | string) {
    insertAdjacentHTML($querySelector(el), "beforeend", renderElements);
  },
  empty(el: Element | string | NodeList | null, html?: string) {
    if (el == null) return el;

    $querySelector(el).forEach((el1) => {
      el1.replaceChildren();

      if (html) {
        el1.innerHTML = html;
      }
    });
  },
  hasClass(el: Element | string | NodeList, styleClassName: string) {
    for (let el1 of $querySelector(el)) {
      if (el1.classList.contains(styleClassName)) {
        return true;
      }
    }

    return false;
  },

  toggleClass(el: Element | string | NodeList | null, styleClassName: string) {
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

  addClass(el: Element | string | NodeList | null | undefined, styleClassName: string) {
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
  removeClass(el: Element | string | NodeList | null, styleClassName: string) {
    if (el == null) return el;

    const classNames = styleClassName.replaceAll(/\s+/g, " ").split(" ");
    $querySelector(el).forEach((el1) => {
      for (let className of classNames) {
        el1.classList.remove(className);
      }
    });
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
  eventOff(el: Element | string | NodeList | null | Document, type: string) {
    if (el == null) return el;

    const eventTypes = type.replaceAll(/\s+/g, " ").split(" ");

    const elements = $querySelector(el);

    const evtInfo = EVENT_HANDLER_MAP.get(el);
    for (const eventType of eventTypes) {
      elements.forEach((el) => {
        el.removeEventListener(eventType, evtInfo[eventType]);
      });

      delete evtInfo[eventType];
    }
    if (Object.keys(evtInfo).length < 1) {
      EVENT_HANDLER_MAP.delete(el);
    }
  },

  eventOn(el: Element | string | NodeList | null | Document, type: string, selector?: any, listener?: any) {
    if (el == null) return el;

    const eventTypes = type.replaceAll(/\s+/g, " ").split(" ");

    const elements = $querySelector(el);

    if (!utils.isString(selector)) {
      listener = selector;

      const fn = (e: Event) => {
        if (listener(e, el) === false) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      };

      for (const eventType of eventTypes) {
        addEventInfo(el, eventType, fn);

        elements.forEach((el) => {
          el.addEventListener(eventType, fn);
        });
      }

      return this;
    }

    const fn = (e: Event) => {
      const evtTarget = e.target as Element;
      const selectorEle = evtTarget.closest(selector);

      if (!selectorEle) return;

      let containsFlag = false;
      for (const el of elements) {
        if (el.contains(selectorEle)) {
          containsFlag = true;
        }
      }

      if (!containsFlag) return;

      if (listener(e, selectorEle) === false) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };

    for (const eventType of eventTypes) {
      addEventInfo(el, eventType, fn);
      elements.forEach((el) => {
        el.addEventListener(eventType, fn);
      });
    }
  },

  getEventPosition(e: any) {
    const evtTouche = e.touches;
    const evt = evtTouche && evtTouche[0] ? evtTouche[0] : e;

    return { x: evt.pageX, y: evt.pageY };
  },
};

function addEventInfo(el: any, eventType: string, listener: any) {
  if (!EVENT_HANDLER_MAP.has(el)) {
    EVENT_HANDLER_MAP.set(el, {});
  }
  EVENT_HANDLER_MAP.get(el)[eventType] = listener;
}

function $querySelector(el: Element | string | NodeList | Document): any[] {
  if (el instanceof Document) {
    return [document];
  }

  if (el instanceof Element) {
    return [el];
  }
  let nodeList;
  if (el instanceof NodeList) {
    nodeList = el;
  } else {
    nodeList = document.querySelectorAll(el);
  }

  const reval: Element[] = [];

  for (let node of nodeList) {
    reval.push(node as Element);
  }

  return reval;
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
