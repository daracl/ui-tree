import Tree from "../Tree";
import { TreeNode } from "@t/TreeNode";

import eventUtils from "src/util/eventUtils";
import nodeUtils from "src/util/nodeUtils";
import utils from "src/util/utils";

// keydown default option
const KEYDOWN_DEFAULT_OPTIONS = {};

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

    if (tree.options.plugins["keydown"]) {
      tree.config.isKeydown = true;
      tree.options.plugins["keydown"] = utils.objectMerge({}, KEYDOWN_DEFAULT_OPTIONS, tree.options.plugins["keydown"]);
    }

    this.initEvt();
  }

  initEvt() {
    eventUtils.eventOn(this.tree.mainElement, "keydown", (e: any) => {
      const focusNode = this.tree.config.focusNode || this.tree.config.selectedNode;

      if (focusNode == null) return;

      const key = eventUtils.getEventKey(e);

      if (key == "f2") {
        focusNode.setEdit();
        return;
      }

      if (key == "delete") {
        focusNode.remove();
        return;
      }

      if (key == "enter") {
        focusNode.select();
        return;
      }

      if (key.startsWith("arrow")) {
        if (key == "arrowdown") {
          this.arrowDown(focusNode);
        } else if (key == "arrowup") {
          this.arrowUp(focusNode);
        } else if (key == "arrowleft") {
          this.arrowLeft(focusNode);
        } else if (key == "arrowright") {
          this.arrowRight(focusNode);
        }

        return false;
      }
    });
  }

  /**
   * 방향키 아래 -> 오픈된 노드중에 하위 노드 선택
   *
   * @param focusNode {TreeNode} 선택된 노드
   * @returns {void}
   */
  public arrowDown(focusNode: TreeNode) {
    const nextNode = findNextNode(focusNode, this.tree, true);

    nextNode?.focus();
  }

  /**
   * 방향키 위로 -> 오픈된 노드중에 상위 노드 선택
   *
   * @param focusNode {TreeNode} 선택된 노드
   * @returns {void}
   */
  public arrowUp(focusNode: TreeNode) {
    if (this.tree.config.rootDepth == 0 && this.tree.config.rootDepth == focusNode.depth) {
      return;
    }

    const parentNode = this.tree.config.allNode[focusNode.pid];

    const childNodes = parentNode.childNodes;
    const nodeIdx = nodeUtils.getNodeIdx(childNodes, focusNode.id);

    if (nodeIdx != 0) {
      findPrevNode(childNodes[nodeIdx - 1])?.focus();
    } else {
      if (0 == nodeIdx && this.tree.config.rootDepth == focusNode.depth) {
        return;
      }
      parentNode.focus();
    }
  }

  /**
   * 방향키 왼쪽 -> 오픈된 노드를 닫기 처리 한다.
   *
   * @param focusNode {TreeNode} 선택된 노드
   * @returns {void}
   */
  public arrowLeft(focusNode: TreeNode) {
    if (focusNode.childNodes.length > 0) {
      if (focusNode.isOpen) {
        focusNode.close();
        return;
      }
    }

    if (focusNode.depth == 0) {
      return;
    }

    const parentNode = this.tree.config.allNode[focusNode.pid];

    if (this.tree.config.rootDepth > parentNode.depth) {
      return;
    }

    parentNode.focus();
  }

  /**
   * 방향키 오른쪽 -> 오픈된 노드를 열기 처리 한다.
   *
   * @param focusNode {TreeNode} 선택된 노드
   * @returns {void}
   */
  public arrowRight(focusNode: TreeNode) {
    const childNodes = focusNode.childNodes;

    if (nodeUtils.isFolder(focusNode)) {
      if (focusNode.isOpen) {
        if (childNodes.length > 0) {
          childNodes[0].focus();
        } else {
          focusNode.focus();
        }
      } else {
        focusNode.open();
      }
    }
  }

  public getSelectIdx(focusNode: TreeNode) {
    return nodeUtils.getNodeIdx(this.tree.config.allNode[focusNode.pid].childNodes, focusNode.id);
  }
}

/**
 *이전 으로 이동할 노드 찾기
 *
 * @param focusNode {TreeNode} 다음 이동할 노트 이전 노드
 * @returns {TreeNode} 이동할 이전 노트 정보
 */
function findPrevNode(focusNode: TreeNode) {
  const childLength = focusNode.childNodes.length;
  if (!focusNode.isOpen || childLength < 1) {
    return focusNode;
  }

  const childNodes = focusNode.childNodes;

  if (childLength - 1 > 0) {
    const node = childNodes[childLength - 1];
    if (node.isOpen) {
      if (node.childNodes.length > 0) {
        return findPrevNode(node);
      }
    }

    return node;
  }
}

/**
 *다음으로 이동할 노드 찾기
 *
 * @param focusNode {TreeNode} 다음 이동할 노트 이전 노드
 * @param tree {Tree} tree
 * @param firstFlag {boolean} 첫번째 호출 여부.
 * @returns
 */
function findNextNode(focusNode: TreeNode, tree: Tree, firstFlag: boolean) {
  if (firstFlag && focusNode.isOpen && focusNode.getChildLength() > 0) {
    return focusNode.childNodes[0];
  } else {
    const parentNode = tree.config.allNode[focusNode.pid];
    const childNodes = parentNode.childNodes;

    const childLength = childNodes.length - 1;
    let nodeIdx = nodeUtils.getNodeIdx(childNodes, focusNode.id);

    if (childLength > nodeIdx) {
      return childNodes[nodeIdx + 1];
    }

    if (childLength == nodeIdx && (tree.config.rootDepth >= focusNode.depth || parentNode.id == tree.config.rootNode.id)) {
      return;
    }

    return findNextNode(parentNode, tree, false);
  }
}
