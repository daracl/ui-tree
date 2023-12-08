export interface OptionCallback {
  (...params: any[]): any;
}

export interface Plugins {
  checkbox?: object;
  dnd?: object;
  edit?: object;
  contextmenu?: object;
}

/**
 * options
 */
export interface Options {
  style: {
    width: string;
    height: string;
    paddingLeft: number;
  };
  enableIcon?: boolean;
  itemKey: {
    id: string;
    pid: string;
    name: string;
    icon: string;
  };
  plugins?: Plugins;
  items: Array;
  openDepth: number;
  toggle: OptionCallback | undefined;
  click: OptionCallback | undefined;
  dblclick: OptionCallback | undefined;
  source: OptionCallback | undefined;
}
