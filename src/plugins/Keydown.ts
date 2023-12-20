import Tree from "../Tree";
import { TreeNode } from "@t/TreeNode";
import domUtils from "src/util/domUtils";

import eventUtils from "src/util/eventUtils";
import nodeUtils from "src/util/nodeUtils";

/**
 * keydown event
 *
 * @export
 * @class Keydown
 * @typedef {Keydown}
 */
export default class Keydown {
  private tree;

  constructor(tree: Tree) {
    this.tree = tree;

    this.initEvt();
  }

  initEvt() {
    eventUtils.eventOn(this.tree.mainElement, "keydown", (e: any) => {
      const selectNode = this.tree.config.selectedNode;

      console.log("1111", selectNode);

      if (selectNode == null) return;

      const key = eventUtils.getEventKey(e);

      if (key == "f2") {
        selectNode.setEdit();
        return;
      }

      if (key == "delete") {
        selectNode.remove();
        return;
      }

      if (key.startsWith("arrow")) {
        if (key == "arrowdown") {
          this.arrowDown(selectNode);
        } else if (key == "arrowup") {
          this.arrowUp(selectNode);
        } else if (key == "arrowleft") {
          this.arrowLeft(selectNode);
        } else if (key == "arrowright") {
          this.arrowRight(selectNode);
        }
        this.tree.mainElement.removeAttribute("tabindex");
        this.tree.mainElement.setAttribute("tabindex", "0");
        this.tree.mainElement.focus();

        return false;
      }
    });
  }

  public arrowDown(selectNode: TreeNode) {
    const childNodes = this.tree.config.allNode[selectNode.pid].childNodes;
    const len = childNodes.length - 1;
    const nodeIdx = nodeUtils.getNodeIdx(childNodes, selectNode.id);

    if (len > nodeIdx) {
      childNodes[nodeIdx + 1].select();
    }
  }

  public arrowUp(selectNode: TreeNode) {
    const parentNode = this.tree.config.allNode[selectNode.pid];
    const childNodes = parentNode.childNodes;
    const nodeIdx = nodeUtils.getNodeIdx(childNodes, selectNode.id);

    if (nodeIdx != 0) {
      childNodes[nodeIdx - 1].select();
    } else {
      parentNode.select();
    }
  }

  public arrowLeft(selectNode: TreeNode) {
    if (selectNode.childNodes.length > 0) {
      if (domUtils.hasClass(nodeUtils.nodeIdToElement(this.tree.mainElement, selectNode.id), "open")) {
        selectNode.close();
      } else {
        this.tree.config.allNode[selectNode.pid].select();
      }
    } else {
      this.tree.config.allNode[selectNode.pid].select();
    }
  }

  public arrowRight(selectNode: TreeNode) {
    const childNodes = selectNode.childNodes;

    if (childNodes.length > 0) {
      if (domUtils.hasClass(nodeUtils.nodeIdToElement(this.tree.mainElement, selectNode.id), "open")) {
        childNodes[0].select();
      } else {
        selectNode.open();
      }
    }
  }

  public getSelectIdx(selectNode: TreeNode) {
    return nodeUtils.getNodeIdx(this.tree.config.allNode[selectNode.pid].childNodes, selectNode.id);
  }
}
