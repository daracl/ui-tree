import { isString } from "./utils";

type ElementType = Element | string | NodeList | Document | null | undefined;



export function before(el: ElementType, renderElements: Element | string) {
  insertAdjacentHTML($querySelector(el), "beforebegin", renderElements);
}

export function after(el: ElementType, renderElements: Element | string) {
  insertAdjacentHTML($querySelector(el), "afterend", renderElements);
}

export function prepend(el: ElementType, renderElements: Element | string) {
  insertAdjacentHTML($querySelector(el), "afterbegin", renderElements);
}

export function append(el: ElementType, renderElements: Element | string) {
  insertAdjacentHTML($querySelector(el), "beforeend", renderElements);
}

export function hasClass(el: ElementType, styleClassName: string) {
  for (let el1 of $querySelector(el)) {
    if (el1.classList.contains(styleClassName)) {
      return true;
    }
  }

  return false;
}

export function toggleClass(el: ElementType, styleClassName: string) {
  if (el == null) return;

  for (let el1 of $querySelector(el)) {
    const classList = el1.classList;
    if (classList.contains(styleClassName)) {
      classList.remove(styleClassName);
    } else {
      classList.add(styleClassName);
    }
  }
}

export function addClass(el: ElementType, styleClassName: string) {
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
}

export function removeClass(el: ElementType, styleClassName: string) {
  if (el == null) return el;

  const classNames = styleClassName.replaceAll(/\s+/g, " ").split(" ");
  for (let className of classNames) {
    $querySelector(el).forEach((el1) => {
      el1.classList.remove(className);
    });
  }
}
  
export function  isInputField(tagName: string): boolean {
  return tagName.search(/(input|select|textarea)/i) > -1;
}

export function  setAttribute(el: Element, attrs: any) {
  for (let key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

export function  getWinScrollTop(){
    return window.pageYOffset || document.documentElement.scrollTop;
  }


/**
 * 주어진 요소의 위치 및 크기를 반환합니다.
 *
 * @param el - 위치를 구할 HTML 요소
 * @param includeScroll - true이면 문서 전체 기준 좌표 (스크롤 보정 포함), false이면 뷰포트 기준 좌표
 * @returns 요소의 top, left, right, bottom, width, height 정보를 포함한 객체
 */
export function getElementRect(
  el: Element,
  includeScroll: boolean = false
): {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
} {
  if (!el) {
    throw new Error("유효하지 않은 요소입니다.");
  }

  const rect = el.getBoundingClientRect();
  const scrollX = includeScroll ? window.scrollX : 0;
  const scrollY = includeScroll ? window.scrollY : 0;

  return {
    top: rect.top + scrollY,
    left: rect.left + scrollX,
    bottom: rect.bottom + scrollY,
    right: rect.right + scrollX,
    width: rect.width,
    height: rect.height,
  };
}


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
  if (isString(renderElements)) {
    elements.forEach((el) => {
      el.insertAdjacentHTML(insertPosition, renderElements);
    });
  } else {
    elements.forEach((el) => {
      el.insertAdjacentElement(insertPosition, renderElements);
    });
  }
}
