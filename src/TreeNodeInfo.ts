import domUtils from "./util/domUtils";
import { TreeNode } from "@t/TreeNode";

import { CHECK_STATE } from "./constants";
import DaraTree from "./DaraTree";
import nodeUtils from "./util/nodeUtils";

/**
 * Daratree class
 *
 * @class Daratree
 * @typedef {Daratree}
 */
export default class TreeNodeInfo implements TreeNode {
  public orginData;

  public id;
  public pid;
  public text;
  public url;
  public checkState;
  public target;
  public icon;
  public depth;
  public childNodes = [] as TreeNode[];

  private daraTree;

  constructor(item: any, daraTree: DaraTree) {
    this.daraTree = daraTree;
    const childCount = (item.childNodes ?? []).length;

    this.id = item[daraTree.options.itemKey.id];
    this.pid = item[daraTree.options.itemKey.pid];
    this.text = item[daraTree.options.itemKey.name];
    this.url = item.url;
    this.checkState = item.checked === true ? 1 : 2;
    this.target = item.target;
    this.icon = item[daraTree.options.itemKey.icon];
    this.depth = daraTree.config.allNode[this.pid] ? daraTree.config.allNode[this.pid].depth + 1 : 0;
    this.orginData = item;
  }

  public moveChild() {}

  public addChild(item: TreeNode) {
    this.childNodes.push(item);
  }

  public open(childOpenFlag: boolean) {
    domUtils.addClass(nodeUtils.nodeIdToElement(this.daraTree.mainElement, this.id), "open");

    if (childOpenFlag) {
      for (const node of this.childNodes) {
        node.open(childOpenFlag);
      }
    }
  }

  public close(childCloseFlag: boolean) {
    if (this.daraTree.options.topMenuView || this.depth > 0) {
      domUtils.removeClass(nodeUtils.nodeIdToElement(this.daraTree.mainElement, this.id), "open");
    }

    if (childCloseFlag) {
      for (const node of this.childNodes) {
        node.close(childCloseFlag);
      }
    }
  }

  public remove() {
    for (let i = this.childLength() - 1; i >= 0; i--) {
      this.childNodes[i].remove();
    }

    nodeUtils.nodeIdToElement(this.daraTree.mainElement, this.id)?.remove();

    const parentNode = this.daraTree.config.allNode[this.pid];

    if (parentNode) {
      console.log("1111 : ", parentNode);
      parentNode.childNodes.splice(
        parentNode.childNodes.findIndex((element: any) => element.id == this.id),
        1
      );
    }

    delete this.daraTree.config.allNode[this.id];

    return {
      id: this.id,
      pid: this.pid,
      text: this.text,
      depth: this.depth,
    };
  }

  public childLength() {
    return this.childNodes.length;
  }
}
