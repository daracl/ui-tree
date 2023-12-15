import nodeUtils from "src/util/nodeUtils";
import DaraTree from "../DaraTree";
import domUtils from "../util/domUtils";
import { TreeNode } from "@t/TreeNode";

/**
 * tree node drag & drop
 *
 * @export
 * @class Dnd
 * @typedef {Dnd}
 */
export default class Dnd {
  private daraTree;
  private dragHelper: HTMLElement;
  private initFlag: boolean = false;

  private startX: number = 0;
  private startY: number = 0;

  private helperTop = 0;
  private helperLeft = 0;
  private nodeHeight = 0;

  private mouseOverEle: HTMLElement | null;
  private enterNode: TreeNode;
  private overPageY: number = 0;

  constructor(daraTree: DaraTree) {
    this.daraTree = daraTree;
    this.helperTop = daraTree.options.plugins["dnd"].marginTop;
    this.helperLeft = daraTree.options.plugins["dnd"].marginLeft;
    this.initEvt();
  }

  initEvt() {
    domUtils.eventOn(this.daraTree.mainElement, "mousedown", ".dt-node", (e: any, ele: Element) => {
      const evtPos = domUtils.getEventPosition(e);

      const nodeInfo = nodeUtils.elementToTreeNode(ele, this.daraTree);

      this.startX = evtPos.x;
      this.startY = evtPos.y;

      domUtils.eventOn(document, "dragstart", () => {
        if (!this.initFlag) {
          this.initFlag = true;
          this.nodeHeight = (ele as HTMLElement).offsetHeight;
        }
        this.daraTree.config.isNodeDrag = true;
        this.mouseOverEle = null;
        this.createHelperElement();

        this.dragHelper.textContent = nodeInfo.text;
        this.dragHelper.style.top = this.startY + "px";
        this.dragHelper.style.left = this.startX + "px";
        domUtils.addClass(this.dragHelper, "dt-drag");
        // /return false;
      });

      domUtils.eventOn(document, "touchmove mousemove", (e: any) => {
        this.mousemove(e);
      });

      domUtils.eventOn(document, "touchend mouseup", (e: any) => {
        this.mouseup(e);
        return false;
      });
    });

    domUtils.eventOn(this.daraTree.mainElement, "mouseover", ".dt-node", (e: any, ele: Element) => {
      if (!this.daraTree.config.isNodeDrag) return;

      const evtPos = domUtils.getEventPosition(e);

      if (this.mouseOverEle == ele) return;
      this.overPageY = evtPos.y;

      this.mouseOverEle = ele as HTMLElement;

      this.enterNode = nodeUtils.elementToTreeNode(ele, this.daraTree);
    });

    /*
    domUtils.eventOn(this.daraTree.mainElement, "mouseout", (e: any, ele: Element) => {
      const evtPos = domUtils.getEventPosition(e);

      let relatedTarget = e.relatedTarget;

      while (relatedTarget) {
        if (relatedTarget == this.mouseOverEle) return;

        relatedTarget = relatedTarget.parentNode;
      }

      this.mouseOverEle = null;
    });
    */
  }

  createHelperElement() {
    const dragHelper = document.createElement("div");

    domUtils.setAttribute(dragHelper, { class: "dt-drag-helper" });

    document.body.appendChild(dragHelper);

    this.dragHelper = dragHelper;
  }

  public mousemove(e: any) {
    if (!this.daraTree.config.isNodeDrag) return;

    const evtPos = domUtils.getEventPosition(e);
    const moveX = evtPos.x + this.helperLeft; //+ this.daraTree.mainElement.offsetLeft;
    const moveY = evtPos.y + this.helperTop; //+ this.daraTree.mainElement.offsetTop;

    this.dragHelper.style.top = moveY + "px";
    this.dragHelper.style.left = moveX + "px";

    if (this.mouseOverEle) {
      let nodeMoveY = this.overPageY - evtPos.y;

      let nodeMoveValue = (Math.abs(nodeMoveY) / this.nodeHeight) * 100;

      // 이동 라인 바 처리 할것.

      console.log(this.overPageY, evtPos.y, "asdf : ", moveY > 0 ? "up" : "down", nodeMoveY, this.nodeHeight, nodeMoveValue);

      if (moveX > 0) {
      }
    }

    //console.log(moveY, this.startY, ";;", moveX, this.startX);
  }

  public mouseup(e: any) {
    this.daraTree.config.isNodeDrag = false;
    //this.dragHelper.remove();
    domUtils.removeClass(this.dragHelper, "dt-drag");
    domUtils.eventOff(document, "touchmove mousemove dragstart");
    domUtils.eventOff(document, "mouseup touchend mouseup");
  }
}

function _movesemove() {
  console.log(1111);
}
