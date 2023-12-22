export interface OptionCallback {
  (...params: any[]): any;
}

export interface Plugins {
  checkbox?: any;
  dnd?: any;
  edit?: {
    width: string;
    before: OptionCallback;
    after: OptionCallback;
  };
  contextmenu?: any;
  keydown: any;
  ajax: {
    url:
      | string
      | {
          create: ""; // 생성시 url
          search: ""; // 목록 url
          modify: ""; // 수정 url
          delete: ""; // 삭제 url
        };
    headers: any; // header 값
    success: OptionCallback; // success 메소드
    error: OptionCallback; // 에러 콜백 메소드
    getParam: OptionCallback; // 파라미터 메소드
  };
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
  rootNode: any;
  enableIcon?: boolean;
  enableRootNode?: boolean;
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
  getIcon: OptionCallback | undefined; // node icon class
  selectNode: OptionCallback | undefined; // node 선택시 이벤트
  focusNode: OptionCallback | undefined; // node focus 이벤트
}
