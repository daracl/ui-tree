import domUtils from "./util/domUtils";
import { TreeNode } from "@t/TreeNode";

import DaraTree from "./DaraTree";
import nodeUtils from "./util/nodeUtils";
import { MOVE_POSITION } from "./constants";

/**
 * Daratree class
 *
 * @class Daratree
 * @typedef {Daratree}
 */
export default class TreeNodeInfo implements TreeNode {
  public orgin;

  public id;
  public pid;
  public text;
  public url;
  public checkState;
  public target;
  public icon;
  public depth;
  public childNodes = [] as TreeNode[];
  public _cud;

  private readonly daraTree;

  constructor(item: any, parentId: any, daraTree: DaraTree) {
    this.daraTree = daraTree;

    this.id = item[daraTree.options.itemKey.id];
    this.pid = parentId;
    this.text = item[daraTree.options.itemKey.text];
    this.url = item.url;
    this.checkState = item.checked === true ? 1 : 2;
    this.target = item.target;
    this._cud = item["_cud"] ?? "";
    this.icon = item[daraTree.options.itemKey.icon];
    this.depth = daraTree.config.allNode[this.pid] ? daraTree.config.allNode[this.pid].depth + 1 : 0;
    this.orgin = item;
  }

  /**
   * 자식 노드 추가.
   *
   * @param item tree node
   */
  public addChild(item: TreeNode) {
    if (this.daraTree.config.allNode[item.id]) {
      this.childNodes.splice(
        this.childNodes.findIndex((element: any) => element.id == this.id),
        1,
        item
      );
    } else {
      this.childNodes.push(item);
    }
  }

  /**
   * 노드 열기
   *
   * @param childOpenFlag 자식 노드 열기 여부
   */
  public open(childOpenFlag: boolean) {
    domUtils.addClass(nodeUtils.nodeIdToElement(this.daraTree.mainElement, this.id), "open");

    if (childOpenFlag) {
      for (const node of this.childNodes) {
        node.open(childOpenFlag);
      }
    }
  }

  /**
   * 노드 닫기
   *
   * @param childCloseFlag 자식 닫을지 여부
   */
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

  /**
   * node 삭제.
   *
   * @returns 삭제된 node
   */
  public remove() {
    for (let i = this.childLength() - 1; i >= 0; i--) {
      this.childNodes[i].remove();
    }

    nodeUtils.nodeIdToElement(this.daraTree.mainElement, this.id)?.remove();

    const parentNode = this.daraTree.config.allNode[this.pid];

    if (parentNode) {
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

  public move(position: string, moveNodeId: any) {
    const movePid = this.daraTree.config.allNode[moveNodeId].pid;
    const moveParentNode = this.daraTree.config.allNode[movePid];
    const childNodes = moveParentNode.childNodes;

    const parentNode = this.daraTree.config.allNode[this.pid];

    if (parentNode) {
      parentNode.childNodes.splice(
        parentNode.childNodes.findIndex((element: any) => element.id == this.id),
        1
      );
    }

    this.pid = movePid;

    if (MOVE_POSITION.PREV == position) {
      for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        if (node.id == moveNodeId) {
          if (i == 0) {
            childNodes.unshift(this);
          } else {
            childNodes.splice(i - 1, 0, this);
          }
        }
      }

      return;
    }

    if (MOVE_POSITION.NEXT == position) {
      for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        if (node.id == moveNodeId) {
          childNodes.splice(i, 0, this);
        }
      }

      return;
    }

    if (MOVE_POSITION.CHILD == position) {
      if (this.daraTree.options.plugins["dnd"].inside == "first") {
        childNodes.unshift(this);
      } else {
        childNodes.push(this);
      }

      return;
    }
  }

  /**
   * 자식노드 수
   *
   * @returns 자식노드 갯수
   */
  public childLength() {
    return this.childNodes.length;
  }

  public click(e: any) {
    domUtils.removeClass(this.daraTree.mainElement.querySelectorAll(".dt-text-content"), "selected");

    domUtils.addClass(nodeUtils.nodeIdToElement(this.daraTree.mainElement, this.id)?.querySelector(".dt-text-content"), "selected");

    this.daraTree.config.selectedNode = this;

    if (this.daraTree.options.click) {
      this.daraTree.options.click.call(null, { node: this, evt: e });
    }
  }

  public doubleClick(e: any) {
    if (this.daraTree.config.isEdit) {
      this.setEdit();
    }
  }
  private setEdit() {
    // 이전에 활성화된 input 영역 삭제.
    this.daraTree.mainElement.querySelectorAll(".dt-text-content.edit").forEach((el: Element) => {
      el.querySelector(".dt-input")?.remove();
      domUtils.removeClass(el, "edit");
    });

    let attrs = { type: "text", class: "dt-input" } as any;

    if (this.daraTree.options.plugins["edit"] && this.daraTree.options.plugins["edit"].width) {
      attrs["style"] = `width:${this.daraTree.options.plugins["edit"].width}`;
    }

    const inputElement = document.createElement("input");
    domUtils.setAttribute(inputElement, attrs);

    const nodeElement = nodeUtils.nodeIdToElement(this.daraTree.mainElement, this.id);
    const contElement = nodeElement?.querySelector(".dt-text-content");
    if (contElement) {
      contElement.appendChild(inputElement);
      domUtils.addClass(contElement, "edit");

      const orginText = this.text;
      inputElement.value = orginText;

      domUtils.eventOn(inputElement, "blur", (e: Event) => {
        const spanEle = contElement.querySelector("span");
        if (spanEle) {
          this.text = inputElement.value;
          spanEle.textContent = this.text;

          if (orginText != this.text) {
            this._cud = "U";
          }
        }
        domUtils.removeClass(contElement, "edit");
        inputElement.remove();
      });

      setTimeout(function () {
        inputElement.focus();
      }, 1);
    }
  }
}
