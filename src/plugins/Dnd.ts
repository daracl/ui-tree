import nodeUtils from "src/util/nodeUtils";
import DaraTree from "../DaraTree";
import domUtils from "../util/domUtils";
import { TreeNode } from "@t/TreeNode";
import { MOVE_POSITION } from "src/constants";

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
  private helperLine: HTMLElement;
  private initFlag: boolean = false;

  private helperTop = 0;
  private helperLeft = 0;
  private nodeHeight = 0;
  private lineViewHeight = 0;

  private dragElement: HTMLElement;
  private dragNode: TreeNode;

  private mouseOverEle: HTMLElement | null;
  private enterNode: TreeNode;
  private overElementTop: number = 0;
  private overElementOffsetTop: number = 0;
  private dragPostion: string = "";

  constructor(daraTree: DaraTree) {
    this.daraTree = daraTree;
    this.helperTop = daraTree.options.plugins["dnd"].marginTop;
    this.helperLeft = daraTree.options.plugins["dnd"].marginLeft;

    this.initEvt();
  }

  initEvt() {
    domUtils.eventOn(this.daraTree.mainElement, "mousedown", ".dt-node", (e: any, ele: Element) => {
      const evtPos = domUtils.getEventPosition(e);

      this.dragElement = ele as HTMLElement;
      this.dragNode = nodeUtils.elementToTreeNode(ele, this.daraTree);

      this.overElementTop = evtPos.y;
      this.mouseOverEle = this.dragElement;
      this.enterNode = this.dragNode;

      domUtils.eventOn(document, "dragstart", () => {
        return false;
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

      if (this.mouseOverEle == ele) return;

      this.mouseOverEle = ele as HTMLElement;
      this.overElementOffsetTop = this.mouseOverEle.offsetTop;
      this.overElementTop = domUtils.getWinScrollTop() + ele.getBoundingClientRect().top;

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

    const helperLine = document.createElement("hr");
    domUtils.setAttribute(helperLine, { class: "dt-drop-helper", style: "" });

    this.daraTree.mainElement.appendChild(helperLine);
    this.helperLine = helperLine;
  }

  /**
   * drag 이동
   *
   * @param e {Event}
   * @returns
   */
  private mousemove(e: any) {
    if (!this.daraTree.config.isNodeDrag) {
      if (!this.initFlag) {
        this.initFlag = true;
        this.nodeHeight = (this.dragElement as HTMLElement).offsetHeight;
        this.lineViewHeight = (this.nodeHeight * 30) / 100;
        this.createHelperElement();
      }

      this.daraTree.config.isNodeDrag = true;
      this.dragHelper.textContent = this.dragNode.text;
      domUtils.addClass(this.dragHelper, "dt-drag");
    }

    const evtPos = domUtils.getEventPosition(e);
    const moveX = evtPos.x + this.helperLeft; //+ this.daraTree.mainElement.offsetLeft;
    const moveY = evtPos.y + this.helperTop; //+ this.daraTree.mainElement.offsetTop;

    this.dragHelper.style.top = moveY + "px";
    this.dragHelper.style.left = moveX + "px";

    const startElementTop = domUtils.getWinScrollTop() + this.dragElement.getBoundingClientRect().top;

    if (this.enterNode.depth == this.dragNode.depth && startElementTop - this.lineViewHeight <= evtPos.y && evtPos.y <= startElementTop + this.nodeHeight + this.lineViewHeight) {
      this.helperLine.style.display = "none";
      return;
    }

    if (this.overElementTop + this.lineViewHeight >= evtPos.y) {
      if (this.dragPostion != MOVE_POSITION.PREV) {
        this.helperLine.style.top = this.overElementOffsetTop + "px";
        this.helperLine.style.display = "block";
        this.dragPostion = MOVE_POSITION.PREV;
      }
    } else if (this.overElementTop + this.nodeHeight - this.lineViewHeight <= evtPos.y) {
      if (this.dragPostion != MOVE_POSITION.NEXT) {
        this.helperLine.style.top = this.overElementOffsetTop + this.nodeHeight - 1 + "px";
        this.helperLine.style.display = "block";
        this.dragPostion = MOVE_POSITION.NEXT;
      }
    } else {
      if (this.dragPostion != MOVE_POSITION.CHILD) {
        this.dragPostion = MOVE_POSITION.CHILD;
      }
      this.helperLine.style.display = "none";
    }

    //console.log(this.enterNode.text, lineView, this.overElementTop, this.nodeHeight, this.lineViewHeight, evtPos.y);

    //console.log(this.overElementTop, evtPos.y, lineView);
  }

  public mouseup(e: any) {
    const dragNode = this.dragNode;
    const dropNode = this.enterNode;
    const position = this.dragPostion;
    if (this.daraTree.options.plugins["dnd"].drop) {
      if (
        this.daraTree.options.plugins["dnd"].drop({
          item: dragNode,
          dropItem: dropNode,
          position: this.dragPostion,
        }) === false
      ) {
        return;
      }
    }

    dragNode.move(position, dropNode.id);

    this.daraTree.config.allNode[dragNode.pid];

    this.daraTree.config.isNodeDrag = false;
    this.dragPostion = "";
    this.mouseOverEle = null;
    this.helperLine.style.display = "none";
    domUtils.removeClass(this.dragHelper, "dt-drag");
    domUtils.eventOff(document, "touchmove mousemove dragstart");
    domUtils.eventOff(document, "mouseup touchend mouseup");
  }
}
