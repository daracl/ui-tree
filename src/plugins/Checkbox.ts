import nodeUtils from "src/util/nodeUtils";
import {Tree} from "../Tree";
import domUtils from "../util/domUtils";
import { TreeNode } from "@t/TreeNode";
import { CHECK_STATE } from "../constants";
import { eventOn } from "src/util/eventUtils";

/**
 * tree node Checkbox
 *
 * @export
 * @class Checkbox
 * @typedef {Checkbox}
 */
export class Checkbox {
  private tree;

  constructor(tree: Tree) {
    this.tree = tree;

    const plugins = this.tree.options.plugins; 

    if(!plugins?.checkbox){
      return; 
    }

    tree.config.isCheckbox = true;

    this.initEvt();
  }

  /**
   * init child node check
   * @param node treenode
   */
  public setNodeCheck(node: TreeNode) {
    if (!this.tree.config.isCheckbox) return;

    if (node.checkState == CHECK_STATE.CHECKED) {
      this.parentNodeCheck(node);
      this.childCheck(node, CHECK_STATE.CHECKED);
    } else if (node.getChildLength() > 0) {
      for (const childNode of node.childNodes) {
        this.setNodeCheck(childNode);
      }
    }
  }

  /**
   * parent node check box 처리
   * @param node treenode
   */
  private parentNodeCheck(node: TreeNode) {
    const parentNode = this.tree.config.allNode[node.pid];

    if (parentNode) {
      let indeterminateCount = 0;
      let unCheckCount = 0;
      for (const childNode of parentNode.childNodes) {
        if (childNode.checkState == CHECK_STATE.UNCHECKED) {
          ++unCheckCount;
        } else if (childNode.checkState == CHECK_STATE.INDETERMINATE) {
          ++indeterminateCount;
        }
      }

      if (indeterminateCount + unCheckCount > 0) {
        if (unCheckCount == parentNode.childNodes.length) {
          this.setCheckBox(parentNode.id, CHECK_STATE.UNCHECKED);
        } else {
          this.setCheckBox(parentNode.id, CHECK_STATE.INDETERMINATE);
        }
      } else {
        this.setCheckBox(parentNode.id, CHECK_STATE.CHECKED);
      }

      this.parentNodeCheck(parentNode);
    }
  }

  initEvt() {
    const rootElement = this.tree.getRootElement();
    
    eventOn(rootElement, "click", (e: Event, checkboxEle: Element) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (checkboxEle) {
        const nodeInfo = nodeUtils.elementToTreeNode(checkboxEle, this.tree);

        if (nodeInfo.checkState == CHECK_STATE.CHECKED) {
          this.childCheck(nodeInfo, CHECK_STATE.UNCHECKED);
        } else {
          this.childCheck(nodeInfo, CHECK_STATE.CHECKED);
        }

        this.parentNodeCheck(nodeInfo);
      }
    },".dt-checkbox");
  }

  public childCheck(node: TreeNode, state: number) {
    if (!this.tree.config.isCheckbox) return;

    this.setCheckBox(node.id, state);

    if (node.childNodes.length > 0) {
      for (let childNode of node.childNodes) {
        this.childCheck(childNode, state);
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
    if (!this.tree.config.isCheckbox) return;

    const rootElement = this.tree.getRootElement();

    const ele = rootElement.querySelector(`[data-dt-id="${id}"] .dt-checkbox`);
    const node = this.tree.config.allNode[id];

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

  public getCheckValues() {
    if (!this.tree.config.isCheckbox) return [];

    let checkNodeValues = [] as TreeNode[];

    for (const node of this.tree.config.rootNode.childNodes) {
      _getCheckValue(checkNodeValues, node);
    }

    return checkNodeValues;
  }
}

function _getCheckValue(checkNodeValues: TreeNode[], node: any) {
  if (node.checkState != CHECK_STATE.UNCHECKED) {
    checkNodeValues.push(node);
  }

  if (node.childNodes.length > 0) {
    for (const childNode of node.childNodes) {
      _getCheckValue(checkNodeValues, childNode);
    }
  }
}
