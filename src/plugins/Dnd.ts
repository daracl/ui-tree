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

      domUtils.eventOn(document, "dragstart", (startEvt: any) => {
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

        if (this.daraTree.options.plugins["dnd"].start) {
          if (
            this.daraTree.options.plugins["dnd"].start({
              item: this.dragNode,
              evt: startEvt,
            }) === false
          ) {
            return false;
          }
        }

        domUtils.eventOn(document, "touchmove mousemove", (e: any) => {
          this.mousemove(e);
        });

        domUtils.eventOn(document, "touchend mouseup", (e: any) => {
          this.mouseup(e);
          return false;
        });
        return false;
      });
    });

    domUtils.eventOn(this.daraTree.mainElement, "mouseover", ".dt-node", (e: any, ele: Element) => {
      if (!this.daraTree.config.isNodeDrag) return;

      if (this.mouseOverEle == ele) return;

      this.mouseOverEle = ele as HTMLElement;
      this.overElementOffsetTop = this.mouseOverEle.offsetTop - 1;
      this.overElementTop = domUtils.getWinScrollTop() + ele.getBoundingClientRect().top;

      this.enterNode = nodeUtils.elementToTreeNode(ele, this.daraTree);
    });

    domUtils.eventOn(this.daraTree.mainElement, "mouseleave", (e: any, ele: Element) => {
      if (!this.daraTree.config.isNodeDrag) return;
      this.mouseOverEle = null;
      this.setNotAllowed();
    });
  }

  hideHelperLine() {
    this.helperLine.style.display = "none";
  }

  showHelperLine() {
    this.helperLine.style.width = `calc(100% - ${nodeUtils.textContentPadding(this.enterNode.depth, this.daraTree) + this.daraTree.config.dndLinePadding}px)`;
    this.helperLine.style.display = "block";
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
    const evtPos = domUtils.getEventPosition(e);
    const moveX = evtPos.x + this.helperLeft; //+ this.daraTree.mainElement.offsetLeft;
    const moveY = evtPos.y + this.helperTop; //+ this.daraTree.mainElement.offsetTop;

    this.dragHelper.style.top = moveY + "px";
    this.dragHelper.style.left = moveX + "px";

    const startElementTop = domUtils.getWinScrollTop() + this.dragElement.getBoundingClientRect().top;

    if (this.mouseOverEle == null || (this.enterNode.depth == this.dragNode.depth && startElementTop - this.lineViewHeight <= evtPos.y && evtPos.y <= startElementTop + this.nodeHeight + this.lineViewHeight)) {
      this.setNotAllowed();
      return;
    }

    let parentEnterNode = this.enterNode;
    while (parentEnterNode.pid) {
      if (parentEnterNode.pid == this.dragNode.id) {
        this.setNotAllowed();
        return;
      }
      parentEnterNode = this.daraTree.config.allNode[parentEnterNode.pid];
    }

    if (this.overElementTop + this.lineViewHeight >= evtPos.y) {
      if (this.dragPostion != MOVE_POSITION.PREV) {
        this.helperLine.style.top = this.overElementOffsetTop + "px";

        this.setDragHelper(MOVE_POSITION.PREV);
      }
    } else if (this.overElementTop + this.nodeHeight - this.lineViewHeight <= evtPos.y) {
      if (this.dragPostion != MOVE_POSITION.NEXT) {
        this.helperLine.style.top = this.overElementOffsetTop + this.nodeHeight + "px";
        this.setDragHelper(MOVE_POSITION.NEXT);
      }
    } else {
      if (this.dragPostion != MOVE_POSITION.CHILD) {
        this.setDragHelper(MOVE_POSITION.CHILD);
      }
      this.hideHelperLine();
    }

    //console.log(this.overElementTop, evtPos.y, lineView);
  }
  setDragHelper(position: string) {
    if (this.dragPostion != position) {
      if (position != MOVE_POSITION.CHILD) this.showHelperLine();
      this.dragPostion = position;
      domUtils.addClass(this.dragHelper, "allowed");
    }
  }

  public mouseup(e: any) {
    this.daraTree.config.isNodeDrag = false;
    this.mouseOverEle = null;
    this.hideHelperLine();
    domUtils.removeClass(this.dragHelper, "dt-drag");
    domUtils.eventOff(document, "touchmove mousemove dragstart mouseup touchend mouseup");

    if (this.dragPostion == MOVE_POSITION.IGNORE) return;

    const dragNode = this.dragNode;
    const dropNode = this.enterNode;
    const position = this.dragPostion;
    if (this.daraTree.options.plugins["dnd"].drop) {
      if (
        this.daraTree.options.plugins["dnd"].drop({
          item: dragNode,
          dropItem: dropNode,
          position: this.dragPostion,
          evt: e,
        }) === false
      ) {
        return;
      }
    }

    dragNode.move(position, dropNode.id);
    this.setNotAllowed();
  }

  /**
   * drop 허용하지 않을때.
   */
  setNotAllowed() {
    this.hideHelperLine();
    this.dragPostion = MOVE_POSITION.IGNORE;
    domUtils.removeClass(this.dragHelper, "allowed");
  }
}
