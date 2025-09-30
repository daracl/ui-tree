import domUtils from './util/domUtils'
import { TreeNode } from '@t/TreeNode'

import Tree from './Tree'
import nodeUtils from './util/nodeUtils'
import { MOVE_POSITION } from './constants'
import { isBlank } from './util/utils'
import { EditOption } from '@t/Options'
import { eventOff, eventOn, getEventKey } from './util/eventUtils'

/**
 *TreeNodeInfo
 *
 * @export
 * @class TreeNodeInfo
 * @typedef {TreeNodeInfo}
 * @implements {TreeNode}
 */
export default class TreeNodeInfo implements TreeNode {
    public orgin

    public id
    public pid
    public text
    public url
    public checkState

    public target
    public icon
    public depth
    public childNodes = [] as TreeNode[]
    public _cud

    public stateFolder: boolean = false

    public isEdit: boolean = false
    public isOpen: boolean = false

    public isLoaded: boolean = false

    private readonly tree

    constructor(item: any, parentId: any, tree: Tree) {
        this.tree = tree

        this.id = item[tree.options.itemKey.id]
        this.pid = parentId
        this.text = item[tree.options.itemKey.text]
        this.url = item.url
        this.checkState = item.state?.checked === true ? 1 : 2
        this.target = item.target
        this._cud = item['_cud'] ?? ''
        this.icon = item[tree.options.itemKey.icon]
        this.depth = tree.config.allNode[this.pid] ? tree.config.allNode[this.pid].depth + 1 : 0
        this.orgin = item

        this.stateFolder = item.state?.folder === true

        this.isOpen = tree.config.isRequest ? false : item.state?.opened === true || tree.options.openDepth == -1 || tree.options.openDepth >= this.depth

        tree.config.selectedNode = item.state?.selected === true ? item : tree.config.selectedNode
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
                item,
            )
        } else {
            if (this.id === item.pid) {
                this.childNodes.push(item)
            }
        }
    }

    /**
     * 노드 열기
     *
     * @param childOpenFlag 자식 노드 열기 여부
     */
    public open(childOpenFlag?: boolean) {
        domUtils.addClass(nodeUtils.nodeIdToElement(this.tree.getRootElement(), this.id), 'dt-open')
        this.isOpen = true

        if (this.tree.config.isRequest && this.isLoaded !== true) {
            this.tree.config.request.search(this)
        }

        if (childOpenFlag === true) {
            for (const node of this.childNodes) {
                node.open(childOpenFlag)
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
            this.isOpen = false
            domUtils.removeClass(nodeUtils.nodeIdToElement(this.tree.getRootElement(), this.id), 'dt-open')
        }

        if (childCloseFlag === true) {
            for (const node of this.childNodes) {
                node.close(childCloseFlag)
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
                this.childNodes[i].remove(childRemoveFlag)
            }
        }

        if (this.tree.config.isRequest && this.tree.config.request.remove(this) === false) {
            return
        }

        this.removeElement()

        delete this.tree.config.allNode[this.id]

        return {
            id: this.id,
            pid: this.pid,
            text: this.text,
            depth: this.depth,
        }
    }
    private removeElement() {
        nodeUtils.nodeIdToElement(this.tree.getRootElement(), this.id)?.remove()

        const parentNode = this.tree.config.allNode[this.pid]

        if (parentNode) {
            parentNode.childNodes.splice(
                parentNode.childNodes.findIndex((element: any) => element.id == this.id),
                1,
            )
        }
    }

    /**
     * 노드 이동
     *
     * @param position {String} move position
     * @param moveNodeId move node id
     */
    public move(position: string, moveNodeId: any) {
        this.removeElement() // 현재 노드 삭제.

        const allNode = this.tree.config.allNode

        let childNodes = []

        switch (position) {
            case MOVE_POSITION.PREV:
            case MOVE_POSITION.NEXT: {
                let moveNodeInfo = allNode[allNode[moveNodeId].pid] // parent node
                childNodes = moveNodeInfo.childNodes

                this.pid = moveNodeInfo.id
                this.depth = moveNodeInfo.depth + 1

                const index = childNodes.findIndex((node: TreeNode) => node.id === moveNodeId)
                const insertIndex = position === MOVE_POSITION.PREV ? index : index + 1
                childNodes.splice(insertIndex, 0, this)

                break
            }

            case MOVE_POSITION.CHILD: {
                const moveNodeInfo = this.tree.config.allNode[moveNodeId]
                childNodes = this.tree.config.allNode[moveNodeId].childNodes

                this.pid = moveNodeInfo.id
                this.depth = moveNodeInfo.depth + 1

                if (this.tree.options.plugins?.dnd.inside === 'first') {
                    childNodes.unshift(this)
                } else {
                    childNodes.push(this)
                }
                break
            }
            default:
                throw new Error(`Invalid position: ${position}`)
        }

        this.setChildNodeDepth()
        this.tree.refresh(this.pid)
    }

    /**
     * 자식 노드 depth 수정.
     */
    setChildNodeDepth() {
        this.childNodes.forEach((item) => {
            item.depth = this.depth + 1

            item.setChildNodeDepth()
        })
    }

    /**
     * 자식노드 수
     *
     * @returns 자식노드 갯수
     */
    public getChildLength() {
        return this.childNodes.length
    }

    /**
     * node click
     *
     * @param e {Event} event
     */
    public click(e: any) {
        this.select()

        if (this.tree.options.click) {
            this.tree.options.click.call(null, { item: this, evt: e })
        }
    }

    /**
     * 폴더 열기 닫기
     *
     */
    public folderToggle() {
        if (this.isOpen) {
            this.close()
        } else {
            this.open()
        }
    }

    /**
     *double click
     *
     * @param e {Event} event
     */
    public doubleClick(e: any) {
        if (!this.tree.config.isEdit) {
            this.folderToggle()
        }
        if (this.tree.options.dblclick) {
            if (
                this.tree.options.dblclick({
                    item: this,
                    evt: e,
                }) === false
            ) {
                return
            }
        }

        this.setEdit()
    }

    /**
     * node text edit
     */
    public setEdit() {
        if (!this.tree.config.isEdit || this.isEdit) return

        // 이전에 활성화된 input 영역 삭제.
        this.tree
            .getRootElement()
            .querySelectorAll('.dt-node-title.edit')
            .forEach((el: Element) => {
                el.querySelector('.dt-input')?.remove()
                domUtils.removeClass(el, 'dt-edit')
            })

        const editOptions = this.tree.options.plugins?.edit ?? ({} as EditOption)

        if (editOptions.before && editOptions.before({ item: this }) === false) {
            return
        }

        this.isEdit = true

        let attrs = { type: 'text', class: 'dt-input' } as any

        const editWidth = editOptions.width
        if (editWidth) {
            attrs['style'] = `width:${editWidth}`
        }

        const inputElement = document.createElement('input')
        domUtils.setAttribute(inputElement, attrs)

        const nodeElement = nodeUtils.nodeIdToElement(this.tree.getRootElement(), this.id)
        const contElement = nodeElement?.querySelector('.dt-node-title')
        if (contElement) {
            contElement.appendChild(inputElement)
            domUtils.addClass(contElement, 'dt-edit')

            const orginText = this.text
            inputElement.value = orginText

            eventOn(inputElement, 'keyup', (e: Event) => {
                const key = getEventKey(e)

                if (key == 'enter') {
                    inputElement.blur()
                    return
                }
            })

            eventOn(inputElement, 'blur', (e: Event) => {
                let changeText = inputElement.value
                if (editOptions.after) {
                    const afterVal = editOptions.after({ item: this, orginText: orginText, text: changeText })
                    if (afterVal === false) {
                        setTimeout(function () {
                            inputElement.focus()
                        }, 1)
                        return
                    }
                    if (!isBlank(afterVal)) {
                        changeText = afterVal
                    }
                }

                this.isEdit = false
                const spanEle = contElement.querySelector('span')
                if (spanEle) {
                    this.text = changeText
                    spanEle.textContent = this.text

                    if (orginText != this.text) {
                        this._cud = 'U'
                    }
                }
                eventOff(inputElement, 'blur keyup')
                domUtils.removeClass(contElement, 'dt-edit')
                inputElement.remove()

                this.tree.config.request.modify(this)
            })

            setTimeout(function () {
                inputElement.focus()
            }, 1)
        }
    }

    /**
     * node 선택
     */
    public select() {
        this.focusOut()
        domUtils.removeClass(this.tree.getRootElement().querySelectorAll('.dt-node-title.selected'), 'dt-selected')

        const nodeElement = nodeUtils.nodeIdToElement(this.tree.getRootElement(), this.id)

        if (nodeElement) {
            this.tree.config.selectedNode = this
            domUtils.addClass(nodeElement.querySelector('.dt-node-title'), 'dt-selected')

            setScrollTop(this.tree.getContainerElement(), nodeElement)

            if (this.tree.options.selectNode) {
                this.tree.options.selectNode({
                    item: this,
                    element: nodeElement,
                })
            }
        }
    }

    /**
     * node 선택
     */
    public focus() {
        domUtils.removeClass(this.tree.getRootElement().querySelectorAll('.dt-node-title.focus'), 'dt-focus')

        const nodeElement = nodeUtils.nodeIdToElement(this.tree.getRootElement(), this.id)

        if (nodeElement) {
            this.tree.config.focusNode = this
            domUtils.addClass(nodeElement.querySelector('.dt-node-title'), 'dt-focus')

            if (this.tree.options.focusNode) {
                this.tree.options.focusNode({
                    item: this,
                    element: nodeElement,
                })
            }

            setScrollTop(this.tree.getContainerElement(), nodeElement)
        }
    }

    public focusOut() {
        domUtils.removeClass(this.tree.getRootElement().querySelectorAll('.dt-node-title.focus'), 'dt-focus')
        this.tree.config.focusNode = null
    }

    /**
     * get parent node
     *
     * @public
     * @returns {TreeNode}
     */
    public getParentNode(): TreeNode {
        return this.tree.config.allNode[this.pid]
    }

    /**
     * all parent nodes
     *
     * @public
     * @returns {TreeNode[]}
     */
    public getParentNodes(): TreeNode[] {
        let pid = this.pid

        let parentNodes = []
        for (let depth = this.depth; depth > 0; depth--) {
            let pNode = this.tree.config.allNode[pid]
            if (pNode) {
                parentNodes.push(pNode)
            }
        }

        return parentNodes
    }
}

/**
 * 스크롤 위치 이동.
 *
 * @param mainElement {HTMLElement} main element
 * @param nodeElement {HTMLElement} 스크롤 이동할 element
 */
function setScrollTop(mainElement: HTMLElement, nodeElement: Element) {
    //nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const scrollTop = mainElement.scrollTop
    const offsetTop = (nodeElement as HTMLElement).offsetTop
    const height = mainElement.offsetHeight
    const eleHeight = (nodeElement.querySelector('.dt-node-title') as HTMLElement).offsetHeight

    if (scrollTop + height < offsetTop + eleHeight) {
        mainElement.scrollTop = offsetTop + eleHeight - height
    } else if (scrollTop > offsetTop) {
        mainElement.scrollTop = offsetTop
    }
}
