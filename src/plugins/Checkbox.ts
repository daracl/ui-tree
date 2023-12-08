import { Options } from "@t/Options";
import utils from "../util/utils";
import nodeUtils from "src/util/nodeUtils";
import DaraTree from "../DaraTree";
import domUtils from "../util/domUtils";
import { TreeNode } from "@t/TreeNode";
import { CHECK_STATE } from "../constants";

/**
 * Daratree class
 *
 * @class Daratree
 * @typedef {Daratree}
 */
export default class Checkbox {
  private daraTree;

  constructor(daraTree: DaraTree) {
    this.daraTree = daraTree;

    this.initCheck();
    this.initEvt();
  }

  initCheck() {}

  initEvt() {
    domUtils.eventOn(this.daraTree.mainElement, "click", ".dt-checkbox", (e: Event, ele: Element) => {
      const checkboxEle = ele.closest(".dt-checkbox");

      if (checkboxEle) {
        const nodeId = nodeUtils.elementToNodeId(ele);

        const nodeInfo = this.daraTree.config.allNode[nodeId];

        if (nodeInfo.checkState == CHECK_STATE.UNCHECKED) {
          this.childCheck(nodeInfo, CHECK_STATE.UNCHECKED);
          this.setCheckBox(nodeId, CHECK_STATE.UNCHECKED);
        } else {
          this.childCheck(nodeInfo, CHECK_STATE.CHECKED);
          this.setCheckBox(nodeId, CHECK_STATE.CHECKED);
        }
      }
    });
  }

  public childCheck(parentNode: TreeNode, state: number) {
    for (let node of parentNode.childNodes) {
      this.setCheckBox(node.id, state);

      if (node.childNodes.length > 0) {
        this.childCheck(node, state);
      }
    }
  }

  /**
   * 체크 박스 체크 하기.
   *
   * @param itemEle {Element} node
   * @param flag {Boolean} true or false
   * @returns nodeid
   */
  public setCheckBox(id: string | number, state: number) {
    const ele = this.daraTree.mainElement.querySelector(`[data-node-id="${id}"] .dt-checkbox`);
    const node = this.daraTree.config.allNode[id];

    if (ele) {
      node.checkState = state;
      domUtils.removeClass(ele, "dt-indeterminate");
      switch (state) {
        case CHECK_STATE.CHECKED:
          domUtils.addClass(ele, "dt-checked");
          break;
        case CHECK_STATE.UNCHECKED:
          domUtils.removeClass(ele, "dt-checked");
          break;
        case CHECK_STATE.INDETERMINATE:
          domUtils.addClass(ele, "dt-indeterminate");
          break;
        default:
          return;
      }
    }
  }
}
