export interface OptionCallback {
  (...params: any[]): any;
}

export interface Plugins {
  checkbox?: any;
  dnd?: any;
  edit?: {
    width: string;
  };
  contextmenu?: any;
  keydown: any;
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
    text: string;
    icon: string;
  };
  plugins?: Plugins;
  items: Array;
  openDepth: number;
  click: OptionCallback | undefined; // click callback
  dblclick: OptionCallback | undefined; // double click callback
  source: OptionCallback | undefined;
  getIcon: OptionCallback | undefined; // node icon class
}
