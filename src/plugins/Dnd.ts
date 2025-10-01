import nodeUtils from 'src/util/nodeUtils'
import {Tree} from '../Tree'
import domUtils from '../util/domUtils'
import { TreeNode } from '@t/TreeNode'
import { MOVE_POSITION } from 'src/constants'
import { eventOff, eventOn, getEventPosition } from 'src/util/eventUtils'
import { objectMerge } from 'src/util/utils'

// dnd default option
const DND_DEFAULT_OPTIONS = {
    marginTop: 10,
    marginLeft: 10,
    inside: 'last',
    drop: (item: any) => {},
    start: (item: any) => {},
}

/**
 * tree node drag & drop
 *
 * @export
 * @class Dnd
 * @typedef {Dnd}
 */
export class Dnd {
    private tree
    private dragHelper: HTMLElement
    private helperLine: HTMLElement
    private initFlag: boolean = false

    private helperTop = 0
    private helperLeft = 0
    private nodeHeight = 0
    private lineViewHeight = 0

    private dragElement: HTMLElement
    private dragNode: TreeNode

    private mouseOverEle: HTMLElement | null
    private enterNode: TreeNode
    private overElementTop: number = 0
    private overElementOffsetTop: number = 0
    private dragPostion: string = ''

    constructor(tree: Tree) {
        this.tree = tree
        const plugins = this.tree.options.plugins

        if (!plugins?.dnd) {
            return
        }

        plugins.dnd = objectMerge({}, DND_DEFAULT_OPTIONS, plugins.dnd)

        tree.config.dndLinePadding = (tree.config.isCheckbox ? 24 : 0) + (tree.options.enableIcon ? 23 : 0)
        tree.config.dndLinePadding = tree.config.dndLinePadding == 0 ? 20 : tree.config.dndLinePadding

        this.helperTop = plugins.dnd.marginTop
        this.helperLeft = plugins.dnd.marginLeft

        this.initEvt()
    }

    initEvt() {
        const containerElement = this.tree.getContainerElement()

        eventOff(containerElement, 'mousedown touchstart mouseover mouseleave mouseup touchend')
        eventOn(
            containerElement,
            'mousedown touchstart',
            (e: any, ele: Element) => {
                const evtPos = getEventPosition(e)

                this.dragElement = ele as HTMLElement
                this.dragNode = nodeUtils.elementToTreeNode(ele, this.tree)

                this.overElementTop = evtPos.y
                this.mouseOverEle = this.dragElement
                this.enterNode = this.dragNode

                eventOn(document, 'dragstart', (startEvt: any) => {
                    if (!this.tree.config.isNodeDrag) {
                        if (!this.initFlag) {
                            this.initFlag = true
                            this.nodeHeight = this.dragElement.offsetHeight
                            this.lineViewHeight = (this.nodeHeight * 30) / 100
                            this.createHelperElement()
                        }

                        this.tree.config.isNodeDrag = true
                        this.dragHelper.textContent = this.dragNode.text
                        domUtils.addClass(this.dragHelper, 'dt-drag')
                    }

                    const plugins = this.tree.options.plugins

                    if (plugins?.dnd.start) {
                        if (
                            plugins.dnd.start({
                                item: this.dragNode,
                                evt: startEvt,
                            }) === false
                        ) {
                            return false
                        }
                    }

                    eventOn(document, 'touchmove mousemove', (e: Event) => {
                        this.mousemove(e)
                    })

                    eventOn(document, 'touchend mouseup', (e: any) => {
                        this.mouseup(e)
                        return false
                    })
                    return false
                })
            },
            '.dt-node',
        )

        eventOn(
            containerElement,
            'mouseover',
            (e: any, ele: Element) => {
                if (!this.tree.config.isNodeDrag) return

                if (this.mouseOverEle == ele) return

                this.mouseOverEle = ele as HTMLElement
                this.overElementOffsetTop = this.mouseOverEle.offsetTop - 1
                this.overElementTop = domUtils.getWinScrollTop() + ele.getBoundingClientRect().top

                this.enterNode = nodeUtils.elementToTreeNode(ele, this.tree)
            },
            '.dt-node',
        )

        eventOn(containerElement, 'mouseleave', (e: any, ele: Element) => {
            if (!this.tree.config.isNodeDrag) return

            this.mouseOverEle = null
            this.setNotAllowed()
        })

        eventOn(containerElement, 'mouseup touchend', (e: UIEvent) => {
            this.tree.config.isNodeDrag = false
        })
    }

    hideHelperLine() {
        this.helperLine.style.display = 'none'
    }

    showHelperLine() {
        this.helperLine.style.width = `calc(100% - ${nodeUtils.textContentPadding(this.enterNode.depth, this.tree) + this.tree.config.dndLinePadding}px)`
        this.helperLine.style.display = 'block'
    }

    createHelperElement() {
        const dragHelper = document.createElement('div')
        domUtils.setAttribute(dragHelper, { class: 'dt-drag-helper' })

        document.body.appendChild(dragHelper)

        this.dragHelper = dragHelper

        const helperLine = document.createElement('hr')
        domUtils.setAttribute(helperLine, { class: 'dt-drop-helper', style: '' })

        this.tree.getContainerElement().appendChild(helperLine)
        this.helperLine = helperLine
    }

    /**
     * drag 이동
     *
     * @param e {Event}
     * @returns
     */
    private mousemove(e: any) {
        const evtPos = getEventPosition(e)
        const moveX = evtPos.x + this.helperLeft //+ this.tree.mainElement.offsetLeft;
        const moveY = evtPos.y + this.helperTop //+ this.tree.mainElement.offsetTop;

        this.dragHelper.style.top = moveY + 'px'
        this.dragHelper.style.left = moveX + 'px'

        const startElementTop = domUtils.getWinScrollTop() + this.dragElement.getBoundingClientRect().top

        if (this.mouseOverEle == null || (this.enterNode.depth == this.dragNode.depth && startElementTop - this.lineViewHeight <= evtPos.y && evtPos.y <= startElementTop + this.nodeHeight + this.lineViewHeight)) {
            this.setNotAllowed()
            return
        }

        let parentEnterNode = this.enterNode

        while (parentEnterNode !== undefined) {
            if (parentEnterNode.pid == this.dragNode.id) {
                this.setNotAllowed()
                return
            }
            parentEnterNode = this.tree.config.allNode[parentEnterNode.pid]
        }

        if (this.overElementTop + this.lineViewHeight >= evtPos.y) {
            if (this.dragPostion != MOVE_POSITION.PREV) {
                this.helperLine.style.top = this.overElementOffsetTop + 'px'

                this.setDragHelper(MOVE_POSITION.PREV)
            }
        } else if (this.overElementTop + this.nodeHeight - this.lineViewHeight <= evtPos.y) {
            if (this.dragPostion != MOVE_POSITION.NEXT) {
                this.helperLine.style.top = this.overElementOffsetTop + this.nodeHeight + 'px'
                this.setDragHelper(MOVE_POSITION.NEXT)
            }
        } else {
            if (this.dragPostion != MOVE_POSITION.CHILD) {
                this.setDragHelper(MOVE_POSITION.CHILD)
            }
            this.hideHelperLine()
        }
    }

    private setDragHelper(position: string): void {
        if (position != MOVE_POSITION.CHILD) {
            const childNode = this.tree.config.allNode[this.enterNode.pid].childNodes
            let checkNode

            for (let i = 0; i < childNode.length; i++) {
                let item = childNode[i]
                if (item.id == this.enterNode.id) {
                    if (position == MOVE_POSITION.PREV) {
                        checkNode = childNode[i - 1]
                    }

                    if (position == MOVE_POSITION.NEXT) {
                        checkNode = childNode[i + 1]
                    }
                    break
                }
            }

            if (checkNode && checkNode.id == this.dragNode.id) {
                this.dragPostion = MOVE_POSITION.IGNORE
                return
            }

            this.showHelperLine()
        } else {
            if (this.enterNode.id == this.dragNode.pid) {
                this.dragPostion = MOVE_POSITION.IGNORE
                return
            }
        }

        this.dragPostion = position
        domUtils.addClass(this.dragHelper, 'dt-allowed')
    }

    public mouseup(e: any) {
        this.tree.config.isNodeDrag = false
        this.mouseOverEle = null
        this.hideHelperLine()
        domUtils.removeClass(this.dragHelper, 'dt-drag')
        eventOff(document, 'touchmove mousemove dragstart mouseup touchend mouseup')

        if (this.dragPostion == MOVE_POSITION.IGNORE) return

        const dragNode = this.dragNode
        const dropNode = this.enterNode
        const position = this.dragPostion
        const plugins = this.tree.options.plugins
        if (plugins?.dnd.drop) {
            if (
                plugins?.dnd.drop({
                    item: dragNode,
                    dropItem: dropNode,
                    position: this.dragPostion,
                    evt: e,
                }) === false
            ) {
                return
            }
        }

        dragNode.move(position, dropNode.id)
        this.setNotAllowed()
    }

    /**
     * drop 허용하지 않을때.
     */
    setNotAllowed() {
        this.hideHelperLine()
        this.dragPostion = MOVE_POSITION.IGNORE
        domUtils.removeClass(this.dragHelper, 'dt-allowed')
    }
}
