const xssFilter = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
} as any;



export function replace(inputText: string): string {
  let returnText = inputText;
  if (returnText) {
    Object.keys(xssFilter).forEach((key) => {
      returnText = returnText.replaceAll(key, xssFilter[key]);
    });
  }
  return returnText;
}


export function generateUUID(dashRemoveFlag: boolean | undefined = true): string {
  let d = new Date().getTime();

  const reval = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);

    return (c === "x" ? r : (r & 0x7) | 0x8).toString(16);
  });

  return dashRemoveFlag ? reval.replace(/-/g, "") : reval;
}

export function hasOwnProp<T extends object, K extends keyof T>(obj: T, key: string | K): key is K {
  return obj.hasOwnProperty(key);
}

export function  unReplace(inputText: string): string {
  let returnText = inputText;

  if (returnText) {
    Object.keys(xssFilter).forEach((key) => {
      returnText = returnText.replaceAll(xssFilter[key], key);
    });
  }
  return returnText;
}


export function  isEmpty (value: any): boolean{
    return isUndefined(value) || value == null;
}

export function   isBlank(value: any): boolean {
  if (value === null) return true;
  if (value === "") return true;
  if (typeof value === "undefined") return true;
  if (typeof value === "string" && (value === "" || value.replace(/\s/g, "") === "")) return true;

  return false;
}

export function   isUndefined(value: any): value is undefined {
  return typeof value === "undefined";
}

export function   isFunction(value: any): value is Function {
  return typeof value === "function";
}

export function isString(value: any): value is string {
  return typeof value === "string";
}
export function isNumber(value: any): value is number {
  if (isBlank(value)) {
    return false;
  }
  value = +value;
  return !isNaN(value);
}

export function isArray(value: any): value is Array<any> {
  return Array.isArray(value);
}

export function replaceXss(text: string): string {
  return replace(text);
}

export function getHashCode(str: string) {
  let hash = 0;
  if (str.length == 0) return hash;
  for (let i = 0; i < str.length; i++) {
    let tmpChar = str.charCodeAt(i);
    hash = (hash << 5) - hash + tmpChar;
    hash = hash & hash;
  }
  return String(hash).replaceAll(/-/g, "_");
}

export function objectMerge(...value: any[]): any {
  let dst: any = {},
    src,
    p;

  let args = value;

  while (args.length > 0) {
    src = args.splice(0, 1)[0];
    if (Object.prototype.toString.call(src) == "[object Object]") {
      for (p in src) {
        if (src.hasOwnProperty(p)) {
          if (Object.prototype.toString.call(src[p]) == "[object Object]") {
            dst[p] = objectMerge(dst[p] || {}, src[p]);
          } else {
            dst[p] = src[p];
          }
        }
      }
    }
  }

  return dst;
}

