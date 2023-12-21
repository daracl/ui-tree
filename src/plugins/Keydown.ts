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

      if (key == "enter") {
        //node hovered 로 처리 하고 enter 처리 할것.
        //
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

  /**
   * 방향키 아래 -> 오픈된 노드중에 하위 노드 선택
   *
   * @param selectNode {TreeNode} 선택된 노드
   * @returns {void}
   */
  public arrowDown(selectNode: TreeNode) {
    const nextNode = findNextNode(selectNode, this.tree, true);

    nextNode?.select();
  }

  /**
   * 방향키 위로 -> 오픈된 노드중에 상위 노드 선택
   *
   * @param selectNode {TreeNode} 선택된 노드
   * @returns {void}
   */
  public arrowUp(selectNode: TreeNode) {
    const parentNode = this.tree.config.allNode[selectNode.pid];

    const childNodes = parentNode.childNodes;
    const nodeIdx = nodeUtils.getNodeIdx(childNodes, selectNode.id);

    if (nodeIdx != 0) {
      findPrevNode(childNodes[nodeIdx - 1])?.select();
    } else {
      if (this.tree.config.rootDepth > parentNode.depth) {
        return;
      }
      parentNode.select();
    }
  }

  /**
   * 방향키 왼쪽 -> 오픈된 노드를 닫기 처리 한다.
   *
   * @param selectNode {TreeNode} 선택된 노드
   * @returns {void}
   */
  public arrowLeft(selectNode: TreeNode) {
    if (selectNode.childNodes.length > 0) {
      if (selectNode.isOpen) {
        selectNode.close();
        return;
      }
    }

    if (selectNode.depth == 0) {
      return;
    }

    const parentNode = this.tree.config.allNode[selectNode.pid];

    if (this.tree.config.rootDepth > parentNode.depth) {
      return;
    }

    parentNode.select();
  }

  /**
   * 방향키 오른쪽 -> 오픈된 노드를 열기 처리 한다.
   *
   * @param selectNode {TreeNode} 선택된 노드
   * @returns {void}
   */
  public arrowRight(selectNode: TreeNode) {
    const childNodes = selectNode.childNodes;

    if (childNodes.length > 0) {
      if (selectNode.isOpen) {
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

function findPrevNode(prevNode: TreeNode) {
  const childNodes = prevNode.childNodes;

  if (childNodes.length < 1) {
    return prevNode;
  }

  for (var i = childNodes.length - 1; i >= 0; i--) {
    const node = childNodes[i];
    if (node.isOpen) {
      if (node.childNodes.length > 0) {
        return findPrevNode(node);
      }
    }

    return node;
  }
}

function findNextNode(selectNode: TreeNode, tree: Tree, firstFlag: boolean) {
  if (firstFlag && selectNode.isOpen && selectNode.getChildLength() > 0) {
    return selectNode.childNodes[0];
  } else {
    const parentNode = tree.config.allNode[selectNode.pid];
    const childNodes = parentNode.childNodes;
    const childLength = childNodes.length - 1;
    let nodeIdx = nodeUtils.getNodeIdx(childNodes, selectNode.id);

    if (childLength > nodeIdx) {
      return childNodes[nodeIdx + 1];
    }

    if (childLength == nodeIdx && tree.config.rootDepth > parentNode.depth) {
      return;
    }

    return findNextNode(parentNode, tree, false);
  }
}
