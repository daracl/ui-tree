import domUtils from "./util/domUtils";
import { TreeNode } from "@t/TreeNode";

import Tree from "./Tree";
import nodeUtils from "./util/nodeUtils";
import { MOVE_POSITION } from "./constants";
import eventUtils from "./util/eventUtils";
import utils from "./util/utils";

/**
 *TreeNodeInfo
 *
 * @export
 * @class TreeNodeInfo
 * @typedef {TreeNodeInfo}
 * @implements {TreeNode}
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

  public isEdit: boolean = false;
  public isOpen: boolean = false;

  private readonly tree;

  constructor(item: any, parentId: any, tree: Tree) {
    this.tree = tree;

    this.id = item[tree.options.itemKey.id];
    this.pid = parentId;
    this.text = item[tree.options.itemKey.text];
    this.url = item.url;
    this.checkState = item.checked === true ? 1 : 2;
    this.target = item.target;
    this._cud = item["_cud"] ?? "";
    this.icon = item[tree.options.itemKey.icon];
    this.depth = tree.config.allNode[this.pid] ? tree.config.allNode[this.pid].depth + 1 : 0;
    this.orgin = item;
  }

  /**
   * 자식 노드 추가.
   *
   * @param item tree node
   */
  public addChild(item: TreeNode) {
    if (this.tree.config.allNode[item.id]) {
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
  public open(childOpenFlag?: boolean) {
    domUtils.addClass(nodeUtils.nodeIdToElement(this.tree.mainElement, this.id), "open");
    this.isOpen = true;

    if (childOpenFlag === true) {
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
  public close(childCloseFlag?: boolean) {
    if (this.tree.config.rootDepth <= this.depth) {
      this.isOpen = false;
      domUtils.removeClass(nodeUtils.nodeIdToElement(this.tree.mainElement, this.id), "open");
    }

    if (childCloseFlag === true) {
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
  public remove(childRemoveFlag?: boolean) {
    if (childRemoveFlag === true) {
      for (let i = this.getChildLength() - 1; i >= 0; i--) {
        this.childNodes[i].remove();
      }
    }

    nodeUtils.nodeIdToElement(this.tree.mainElement, this.id)?.remove();

    const parentNode = this.tree.config.allNode[this.pid];

    if (parentNode) {
      parentNode.childNodes.splice(
        parentNode.childNodes.findIndex((element: any) => element.id == this.id),
        1
      );
    }

    delete this.tree.config.allNode[this.id];

    return {
      id: this.id,
      pid: this.pid,
      text: this.text,
      depth: this.depth,
    };
  }

  /**
   * 노드 이동
   *
   * @param position {String} move position
   * @param moveNodeId move node id
   */
  public move(position: string, moveNodeId: any) {
    this.remove(); // 현재 노드 삭제.

    const allNode = this.tree.config.allNode;

    let childNodes = [];

    switch (position) {
      case MOVE_POSITION.PREV:
      case MOVE_POSITION.NEXT: {
        let moveNodeInfo = allNode[allNode[moveNodeId].pid]; // parent node
        childNodes = moveNodeInfo.childNodes;

        this.pid = moveNodeInfo.id;
        this.depth = moveNodeInfo.depth + 1;

        const index = childNodes.findIndex((node: TreeNode) => node.id === moveNodeId);
        const insertIndex = position === MOVE_POSITION.PREV ? index : index + 1;
        childNodes.splice(insertIndex, 0, this);

        break;
      }
      case MOVE_POSITION.CHILD: {
        const moveNodeInfo = this.tree.config.allNode[moveNodeId];
        childNodes = this.tree.config.allNode[moveNodeId].childNodes;

        this.pid = moveNodeInfo.id;
        this.depth = moveNodeInfo.depth + 1;

        if (this.tree.options.plugins["dnd"].inside === "first") {
          childNodes.unshift(this);
        } else {
          childNodes.push(this);
        }
        break;
      }
      default:
        throw new Error(`Invalid position: ${position}`);
    }

    this.setChildNodeDepth();
    allNode[this.id] = this;

    this.tree.refresh(this.pid);
  }

  /**
   * 자식 노드 depth 수정.
   */
  setChildNodeDepth() {
    this.childNodes.forEach((item) => {
      item.depth = this.depth + 1;

      item.setChildNodeDepth();
    });
  }

  /**
   * 자식노드 수
   *
   * @returns 자식노드 갯수
   */
  public getChildLength() {
    return this.childNodes.length;
  }

  /**
   * node click
   *
   * @param e {Event} event
   */
  public click(e: any) {
    this.select();

    if (this.tree.options.click) {
      this.tree.options.click.call(null, { item: this, evt: e });
    }
  }

  /**
   * 폴더 열기 닫기
   *
   */
  public folderToggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   *double click
   *
   * @param e {Event} event
   */
  public doubleClick(e: any) {
    if (!this.tree.config.isEdit) {
      this.folderToggle();
    }
    if (this.tree.options.dblclick) {
      if (
        this.tree.options.dblclick({
          item: this,
          evt: e,
        }) === false
      ) {
        return;
      }
    }

    this.setEdit();
  }
  /**
   * node text edit
   */
  public setEdit() {
    if (!this.tree.config.isEdit || this.isEdit) return;

    // 이전에 활성화된 input 영역 삭제.
    this.tree.mainElement.querySelectorAll(".dt-text-content.edit").forEach((el: Element) => {
      el.querySelector(".dt-input")?.remove();
      domUtils.removeClass(el, "edit");
    });

    const editOptions = this.tree.options.plugins.edit;

    if (editOptions.before && editOptions.before({ item: this }) === false) {
      return;
    }

    this.isEdit = true;

    let attrs = { type: "text", class: "dt-input" } as any;

    const editWidth = editOptions.width;
    if (editWidth) {
      attrs["style"] = `width:${editWidth}`;
    }

    const inputElement = document.createElement("input");
    domUtils.setAttribute(inputElement, attrs);

    const nodeElement = nodeUtils.nodeIdToElement(this.tree.mainElement, this.id);
    const contElement = nodeElement?.querySelector(".dt-text-content");
    if (contElement) {
      contElement.appendChild(inputElement);
      domUtils.addClass(contElement, "edit");

      const orginText = this.text;
      inputElement.value = orginText;

      eventUtils.eventOn(inputElement, "keyup", (e: Event) => {
        const key = eventUtils.getEventKey(e);

        if (key == "enter") {
          inputElement.blur();
          return;
        }
      });

      eventUtils.eventOn(inputElement, "blur", (e: Event) => {
        let changeText = inputElement.value;
        if (editOptions.after) {
          const afterVal = editOptions.after({ item: this, orginText: orginText, text: changeText });
          if (afterVal === false) {
            setTimeout(function () {
              inputElement.focus();
            }, 1);
            return;
          }
          if (!utils.isBlank(afterVal)) {
            changeText = afterVal;
          }
        }

        this.isEdit = false;
        const spanEle = contElement.querySelector("span");
        if (spanEle) {
          this.text = changeText;
          spanEle.textContent = this.text;

          if (orginText != this.text) {
            this._cud = "U";
          }
        }
        eventUtils.eventOff(inputElement, "blur keyup");
        domUtils.removeClass(contElement, "edit");
        inputElement.remove();
      });

      setTimeout(function () {
        inputElement.focus();
      }, 1);
    }
  }

  /**
   * node 선택
   */
  public select() {
    domUtils.removeClass(this.tree.mainElement.querySelectorAll(".dt-text-content.selected"), "selected");

    const nodeElement = nodeUtils.nodeIdToElement(this.tree.mainElement, this.id);

    if (nodeElement) {
      this.tree.config.selectedNode = this;
      domUtils.addClass(nodeElement.querySelector(".dt-text-content"), "selected");
      const scrollTop = this.tree.mainElement.scrollTop;
      const offsetTop = (nodeElement as HTMLElement).offsetTop;
      const height = this.tree.mainElement.offsetHeight;
      const eleHeight = (nodeElement.querySelector(".dt-text-content") as HTMLElement).offsetHeight;

      if (height < offsetTop + eleHeight) {
        this.tree.mainElement.scrollTop = scrollTop + eleHeight + 2;
      } else if (scrollTop > offsetTop) {
        this.tree.mainElement.scrollTop = scrollTop - (eleHeight + 2);
      }
      if (this.tree.options.selectNode) {
        this.tree.options.selectNode({
          item: this,
          element: nodeElement,
        });
      }
    }
  }
}
