import { Options } from "@t/Options";
import utils from "./util/utils";
import treeEvent from "./event/initEvents";
import { Message } from "@t/Message";
import Lanauage from "./util/Lanauage";
import domUtils from "./util/domUtils";
import { TreeNode } from "@t/TreeNode";
import Checkbox from "./plugins/Checkbox";
import { CHECK_STATE } from "./constants";

const defaultOptions = {
  style: {
    width: "auto",
    height: "100%",
    paddingLeft: 12,
  },
  itemKey: {
    id: "id",
    pid: "pid",
    name: "name",
    icon: "icon",
  },
  plugins: {},
  enableIcon: true,
  items: [],
  openDepth: 1,
  toggle: (nodeItem) => {},
  click: (nodeItem) => {},
  dblclick: (nodeItem) => {},
} as Options;

interface ComponentMap {
  [key: string]: Daratree;
}

// all instance
const allInstance: ComponentMap = {};

/**
 * Daratree class
 *
 * @class Daratree
 * @typedef {Daratree}
 */
export default class Daratree {
  public options;

  private orginStyleClass;

  private selector: string;

  private prefix: string;

  public mainElement: HTMLElement;

  public config: any;

  constructor(selector: string, options: Options, message: Message) {
    const mainElement = document.querySelector<HTMLElement>(selector);
    if (!mainElement) {
      throw new Error(`${selector} tree selector not found`);
    }

    this.options = utils.objectMerge({}, defaultOptions, options);

    this.orginStyleClass = mainElement.className;
    mainElement.classList.add("dara-tree");

    if (this.options.style) {
      let style = [];
      style.push(mainElement.getAttribute("style") + ";");
      if (this.options.style.width) style.push(`width:${this.options.style.width};`);
      if (this.options.style.height) style.push(`height:${this.options.style.height};`);

      mainElement.setAttribute("style", style.join(""));
    }

    this.selector = selector;
    this.mainElement = mainElement;

    this.prefix = "dt" + utils.getHashCode(selector);

    this.initConfig();

    this.init();

    allInstance[selector] = this;
  }
  initConfig() {
    this.config = {
      allNode: {},
      selected: null,
      selectedNode: null,
      selectedFound: false,
      completed: false,
      rootNodes: [],
      topMenuView: false,
      checkbox: {},
    };

    this.config.isCheckbox = !utils.isUndefined(this.options.plugins["checkbox"]);
    this.config.isDnd = !utils.isUndefined(this.options.plugins["dnd"]);
    this.config.isContextmenu = !utils.isUndefined(this.options.plugins["contextmenu"]);
    this.config.isEdit = !utils.isUndefined(this.options.plugins["edit"]);
  }

  public init() {
    this.request();
    this.initEvt();
  }
  initEvt() {
    treeEvent.expanderClick(this, this.mainElement);
    treeEvent.textClick(this, this.mainElement);

    if (this.config.isCheckbox) {
      this.config.checkbox = new Checkbox(this);
    }
  }

  public static setMessage(message: Message): void {
    Lanauage.set(message);
  }

  public request() {
    const opts = this.options;

    const callbackResponse = (items: any[]) => {
      this.treeGrid(items);
    };

    if (utils.isFunction(opts.source)) {
      opts.source(this.config.selectedNode, callbackResponse);
    } else if (utils.isArray(opts.items)) {
      this.treeGrid(opts.items);
    }
  }

  public treeGrid(nodes: any[]) {
    for (const node of nodes) {
      this.addNode(node);
    }

    this.render();
  }

  public addNode(node: any) {
    const pid = node[this.options.itemKey.pid];
    const id = node[this.options.itemKey.id];

    const addNode = this.createNode(pid, node);
    const parentNode = this.config.allNode[pid];

    if (parentNode) {
      this.config.allNode[pid].childNodes.push(addNode);
      addNode.sortOrder = this.config.allNode[pid].childCount = this.config.allNode[pid].childCount + 1;
      if (parentNode.checkState == CHECK_STATE.CHECKED) {
        addNode.checkState = CHECK_STATE.CHECKED;
      }
    } else {
      this.config.rootNodes.push(addNode);
    }

    if (node.childNodes && node.childNodes.length > 0) {
      for (const childNode of node.childNodes) {
        this.addNode(childNode);
      }
    }

    this.config.allNode[id] = addNode;
  }

  private createNode(pid: any, item: any): TreeNode {
    const childCount = (item.childNodes ?? []).length;
    return {
      id: item[this.options.itemKey.id],
      pid: item[this.options.itemKey.pid],
      text: item[this.options.itemKey.name],
      icon: item[this.options.itemKey.icon],
      checked: item.checked === true ? 1 : 2,
      orginData: item,
      childCount: childCount,
      sortOrder: 0,
      depth: this.config.allNode[pid] ? this.config.allNode[pid].depth + 1 : 0,
      childNodes: [],
    } as TreeNode;
  }

  public render() {
    const sNode = this.config.selectedNode;
    const allNode = this.config.allNode;

    if (sNode == null) {
      // init load
      this.mainElement.innerHTML = `<ul id="${this.prefix}" class="dara-tree" ondrag="return false">
        ${this.getNodeTemplate(this.config.rootNodes)}
        </ul>`;
    } else {
      const selectElemnt = this.mainElement.querySelector(`[data-node-id="${sNode.id}"]>.dt-children`);
      if (selectElemnt) {
        selectElemnt.innerHTML = this.getNodeTemplate(allNode[sNode.id].childNodes);
      }
    }
    this.nodeSelect();

    // 이벤트 처리할것.
  }

  private nodeSelect() {
    const sNode = this.config.selectedNode;
    if (sNode != null && sNode != "") {
      const selectNode = document.getElementById(sNode.id + "_a");
      if (selectNode) {
        selectNode.className = "style2";
      }
      return sNode;
    }
  }

  private getNodeTemplate(viewNodes: TreeNode[]): string {
    const treeHtml = [];
    viewNodes = viewNodes ?? this.config.rootNodes;
    const childNodeLength = viewNodes.length;

    const paddingLeft = this.options.style.paddingLeft;
    const openDepth = this.options.openDepth;

    for (let i = 0; i < childNodeLength; i++) {
      let treeNode = viewNodes[i];

      let childNodes = treeNode.childNodes;

      const openClass = openDepth == -1 || openDepth >= treeNode.depth ? "open" : "";

      if (treeNode.depth == 0) {
        treeHtml.push(
          `<li data-node-id="${treeNode.id}" class="open">
              <div style="display:${this.options.topMenuView ? "inline" : "none"}">
                ${this.getExpandIconHtml(treeNode)}
                ${this.getNodeNameHtml(treeNode)}
              </div>
              <ul id="c_${treeNode.id}" class="dt-children">${this.getNodeTemplate(childNodes)}</ul>
            </li>`
        );
      } else {
        let stylePaddingLeft = (treeNode.depth - 1) * paddingLeft;

        treeHtml.push(
          `<li data-node-id="${treeNode.id}" class="${openClass}">
            <div class="dt-node" style="padding-left:${stylePaddingLeft}px">
              ${this.getExpandIconHtml(treeNode)}
              ${this.getNodeNameHtml(treeNode)}
            </div>
            <ul class="dt-children">${treeNode.childCount == 0 ? "" : this.getNodeTemplate(childNodes)}</ul>
          </li>`
        );
      }
    }

    return treeHtml.join("");
  }

  private getExpandIconHtml(tNode: TreeNode) {
    return `<i class="dt-expander ${tNode.childCount > 0 ? "visible" : ""}"></i>`;
  }

  private getNodeNameHtml(tNode: TreeNode) {
    let icon = tNode.icon;
    let iconHtml = "";
    if (utils.isBlank(icon)) {
      icon = tNode.childCount == 0 ? "dt-file" : "dt-folder";
      if (this.options.enableIcon) {
        iconHtml = `<i class="dt-icon ${icon}"></i>`;
      }
    } else {
      iconHtml = `<i class="dt-icon ${icon}"></i>`;
    }

    let checkboxHtml = "";
    if (this.config.isCheckbox) {
      checkboxHtml = `<label class="dt-checkbox"><span class="dt-icon checkbox"></span></label>`;
    }

    return `<a href ="javascript:" class="dt-text-content">${checkboxHtml}${iconHtml}${tNode.text}</a>`;
  }

  public getPrefix() {
    return this.prefix;
  }

  /**
   * 설정 옵션 얻기
   */
  public getOptions = () => {
    return this.options;
  };

  /**
   * set items
   * @param items {array} items
   */
  public setItems(items: any[]) {
    this.options.items = items;
  }

  public static instance(selector?: string) {
    if (utils.isUndefined(selector) || utils.isBlank(selector)) {
      const keys = Object.keys(allInstance);
      if (keys.length > 1) {
        throw new Error(`selector empty : [${selector}]`);
      }
      selector = keys[0];
    }

    return allInstance[selector];
  }

  public destroy = () => {
    this.mainElement.className = this.orginStyleClass;
    this.mainElement.replaceChildren();

    for (const key in this) {
      if (utils.hasOwnProp(this, key)) {
        delete this[key];
        delete allInstance[this.selector];
      }
    }
  };
}
