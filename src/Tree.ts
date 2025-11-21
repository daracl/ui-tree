import { Options } from '@t/Options'
import { ConfigInfo } from '@t/ConfigInfo'
import { generateUUID, hasOwnProp, isArray, isBlank, isNumber, isString, isUndefined, objectMerge } from './util/utils'
import { expanderClick, textClick } from './event/initEvents'
import { addClass, hasClass, removeClass, setAttribute } from './util/domUtils'
import { TreeNode } from '@t/TreeNode'
import { Checkbox } from './plugins/Checkbox'
import { CHECK_STATE } from './constants'
import { TreeNodeInfo } from './TreeNodeInfo'
import nodeUtils from './util/nodeUtils'
import { Dnd } from './plugins/Dnd'
import { Keydown } from './plugins/Keydown'
import { Request } from './plugins/Request'
import { Search } from './plugins/Search'
import { TreeNodeRenderer } from './TreeNodeRenderer'

declare const APP_VERSION: string

let defaultOptions = {
    style: {
        width: '',
        height: '',
        paddingLeft: 12,
    },
    selectOnWholeRow: false,
    multiple: true,
    rootNode: {
        id: '',
        text: 'Root',
    },
    enableRootNode: false,
    itemKey: {
        id: 'id',
        pid: 'pid',
        text: 'text',
        icon: 'icon',
    },
    plugins: {
        keydown: {},
    },
    enableIcon: true,
    items: [],
    openDepth: 0,
    click: (nodeItem) => {},
    dblclick: (nodeItem) => {},
} as Options

interface ComponentMap {
    [key: string]: Tree
}

// all instance
const ALL_INSTANCE: ComponentMap = {}

// edit default option
const EDIT_DEFAULT_OPTIONS = {
    before: false,
    after: false,
}

const ETC_NODE_ID = '$__etc'

/**
 * Tree class
 *
 * @class Tree
 * @typedef {Tree}
 */
export class Tree {
    public static VERSION = `${APP_VERSION}`

    public options: Options

    private orginStyle
    private orginStyleClass

    private selector: string

    private containerElement: HTMLElement

    private rootElement: HTMLElement

    public config: ConfigInfo

    private treeNodeRenderer: TreeNodeRenderer

    constructor(selector: string, options: Options) {
        const containerElement = document.querySelector<HTMLElement>(selector)
        if (!containerElement) {
            throw new Error(`${selector} tree selector not found`)
        }

        this.options = objectMerge({}, defaultOptions, options) as Options

        this.orginStyleClass = containerElement.className

        if (this.options.style) {
            let style = []

            let addStyle = (this.orginStyle = containerElement.getAttribute('style')) || ''
            const width = this.options.style.width
            if (this.options.style.width) {
                addStyle = addStyle.replace(/(width:).+?(;[\s]?|$)/g, '')

                style.push(`width:${isNumber(width) ? width + 'px' : width};`)
            }
            const height = this.options.style.height
            if (height) {
                addStyle = addStyle.replace(/(height:).+?(;[\s]?|$)/g, '')

                style.push(`height:${isNumber(height) ? height + 'px' : height};`)
            }

            style.push(addStyle ? addStyle + (addStyle.endsWith(';') ? '' : ';') : '')

            containerElement.setAttribute('style', style.join(''))
        }

        this.selector = selector
        containerElement.classList.add('daracl-tree')

        this.containerElement = containerElement
        this.initContainerElement()

        const rootElement = document.createElement('ul')

        setAttribute(rootElement, {
            class: `dt-root ${this.options.selectOnWholeRow ? 'dt-whole-row' : ''}`,
            tabindex: '-1',
        })

        containerElement.append(rootElement)
        this.rootElement = rootElement

        this.initConfig()

        this.treeNodeRenderer = new TreeNodeRenderer(this, this.options)

        this.init()

        ALL_INSTANCE[selector] = this
    }

    /**
     * get container element
     *
     * @returns tree container element
     */
    public getContainerElement() {
        return this.containerElement
    }

    /**
     * get tree root element
     *
     * @returns tree root element
     */
    public getRootElement() {
        return this.rootElement
    }

    /**
     * tree 생성
     *
     * @public
     * @static
     * @param {string} selector
     * @param {Options} options
     * @returns {Tree}
     */
    public static create(selector: string, options: Options): Tree {
        return new Tree(selector, options)
    }

    /**
     * tree instance 얻기
     *
     * @public
     * @static
     * @param {?string} [selector]
     * @returns {Tree}
     */
    public static instance(selector?: string) {
        if (isUndefined(selector) || isBlank(selector)) {
            const keys = Object.keys(ALL_INSTANCE)
            if (keys.length > 1) {
                throw new Error(`selector empty : [${selector}]`)
            }
            selector = keys[0]
        }

        return ALL_INSTANCE[selector]
    }

    /**
     * default options 셋팅
     *
     * @static
     * @typedef {Object} defaultOptions
     */
    public static setOptions(options: Options) {
        defaultOptions = objectMerge({}, defaultOptions, options)
    }

    private initConfig() {
        const plugins = this.options.plugins
        this.config = {
            startPaddingLeft: this.options.enableRootNode ? this.options.style.paddingLeft : 0,
            rootDepth: this.options.enableRootNode ? 0 : 1,
            allNode: {},
            selectedNode: null,
            focusNode: null,
            isFocus: false,
            rootNode: {},
            isCheckbox: false,
            isDnd: false,
            isContextmenu: false,
            isEdit: false,
            isKeydown: false,
            isNodeDrag: false,
            isRequest: false,
        } as ConfigInfo

        this.config.rootNode = new TreeNodeInfo(objectMerge({}, this.options.rootNode), '$$root$$', this)
        this.config.allNode[this.config.rootNode.id] = this.config.rootNode
        this.config.selectedNode = this.config.rootNode

        if (plugins?.edit) {
            this.config.isEdit = true
            plugins.edit = objectMerge({}, EDIT_DEFAULT_OPTIONS, plugins.edit)
        }

        this.config.request = new Request(this)
        this.config.checkbox = new Checkbox(this)
        this.config.search = new Search(this)
    }

    public init() {
        this.initEvt()
        this.request()
    }

    private initEvt() {
        this.config.keydown = new Keydown(this)

        expanderClick(this, this.rootElement)

        this.config.dnd = new Dnd(this)

        textClick(this, this.rootElement)
    }

    public request(id?: any) {
        const opts = this.options

        if (this.config.isRequest) {
            id = !isUndefined(id) ? id : this.config.rootNode.id
            this.config.request.search(this.config.allNode[id])
        } else if (isArray(opts.items)) {
            this.addNode(opts.items)
        }
    }

    public refresh(id: any) {
        const refreshNode = this.config.allNode[id]

        if (!refreshNode) {
            throw new Error(`node not found : [${id}] `)
        }

        refreshNode.isLoaded = false

        this.render(id)
    }

    /**
     * tree node 추가.
     *
     * @param nodeItem {object|array} add node items
     * @param parentId {any} parent id
     * @param options {Object} add options
     */
    public addNode(nodeItem: any[] | any, parentId?: any, options?: any) {
        let nodeArr = []
        if (!isArray(nodeItem)) {
            nodeArr.push(nodeItem)
        } else {
            nodeArr = nodeItem
        }

        const rootNodeId = this.config.rootNode.id
        for (const node of nodeArr) {
            this.treeGrid(node, parentId)
        }
        parentId = !isUndefined(parentId) ? parentId : rootNodeId

        this.render(parentId)

        this.config.allNode[parentId]?.open()
    }

    public createNode(nodeInfo: any) {
        nodeInfo = nodeInfo ?? {}
        nodeInfo['_cud'] = 'C'
        nodeInfo[this.options.itemKey.pid] = nodeInfo.pid ?? nodeInfo[this.options.itemKey.pid] ?? (this.config.selectedNode ? this.config.selectedNode.id : this.config.rootNode.id)
        nodeInfo[this.options.itemKey.id] = nodeInfo.id ?? nodeInfo[this.options.itemKey.id] ?? generateUUID()
        nodeInfo[this.options.itemKey.text] = nodeInfo.text ?? nodeInfo[this.options.itemKey.text] ?? 'New Node'

        this.addNode(nodeInfo)

        this.config.request.create(nodeInfo)
    }

    private treeGrid(node: any, parentId?: any) {
        const pid = parentId ?? node[this.options.itemKey.pid]
        const id = node[this.options.itemKey.id]

        if (this.config.rootNode.id === id) {
            this.config.rootNode.orgin = node
            return
        }

        let addNodeItem
        if (this.config.allNode[id]) {
            addNodeItem = this.config.allNode[id]
            addNodeItem.pid = pid
            addNodeItem.orgin = node
        } else {
            addNodeItem = new TreeNodeInfo(node, pid, this)
        }

        const parentNode = this.config.allNode[pid]

        if (parentNode) {
            parentNode.addChild(addNodeItem)

            if (parentNode.checkState == CHECK_STATE.CHECKED) {
                addNodeItem.checkState = CHECK_STATE.CHECKED
            }
        } else {
            this.config.rootNode.addChild(addNodeItem)
        }

        if (node.children && node.children.length > 0) {
            for (const childNode of node.children) {
                this.addNode(childNode)
            }
        }

        this.config.allNode[id] = addNodeItem
    }

    private render(id: any) {
        let renderNode: TreeNode

        if (id === this.config.rootNode.id) {
            renderNode = this.config.rootNode

            const liElement = this.treeNodeRenderer.createNodeElement(renderNode, this.options.enableRootNode ? 'display:inline' : 'display:none', true, true)

            const ulElement = this.treeNodeRenderer.createChildNodeElement(renderNode)
            ulElement.appendChild(this.treeNodeRenderer.getNodeRender(renderNode))

            liElement.appendChild(ulElement)

            // init tree element
            this.rootElement.appendChild(liElement)
        } else {
            if (isBlank(id)) {
                return
            }

            renderNode = this.config.allNode[id]

            const renderNodeElement = nodeUtils.nodeIdToElement(this.rootElement, renderNode.id) as HTMLElement

            if (!renderNodeElement) return

            let childNodeElemnt = renderNodeElement.querySelector(`:scope>.dt-children`)

            const nodeElement = this.treeNodeRenderer.getNodeRender(renderNode)
            // dt-children없을때 생성하고 추가
            if (!childNodeElemnt) {
                const ulElement = this.treeNodeRenderer.createChildNodeElement(renderNode)
                ulElement.appendChild(nodeElement)

                renderNodeElement.appendChild(ulElement)
            } else {
                if (typeof childNodeElemnt.replaceChildren == 'function') {
                    childNodeElemnt.replaceChildren(nodeElement)
                } else {
                    childNodeElemnt.textContent = ''
                    childNodeElemnt.appendChild(nodeElement)
                }
            }

            this.setNodeContent(renderNode)
        }

        this.config.checkbox.setNodeCheck(renderNode)
    }

    private setNodeContent(selectedNode: TreeNode) {
        const parentElement = this.rootElement.querySelector(`[data-dt-id="${selectedNode.id}"]>.dt-node`)

        if (parentElement) {
            // 아이콘 활성화 일경우 아이콘 변경.
            if (this.options.enableIcon) {
                const iconElement = parentElement.querySelector('i.dt-icon')
                const icon = nodeUtils.getIcon(selectedNode)
                if (!hasClass(iconElement, icon)) {
                    removeClass(iconElement, 'dt-folder dt-file')
                    addClass(iconElement, icon)
                }
            }

            if (nodeUtils.isFolder(selectedNode) && parentElement.querySelector('.dt-expander.dt-visible') == null) {
                // 폴더가 아닐 경우 폴더로 변경.
                addClass(parentElement.querySelector('.dt-expander'), 'dt-visible')
            } else if (!nodeUtils.isFolder(selectedNode) && parentElement.querySelector('.dt-expander.dt-visible')) {
                // 폴더일 경우 일반 노드로 변경.
                removeClass(parentElement.querySelector('.dt-expander'), 'dt-visible')
            }
        }
    }

    /**
     * 설정 옵션 얻기
     */
    public getOptions = () => {
        return this.options
    }

    /**
     * Tree node 정보
     *
     * @param id {any} node id
     * @returns {TreeNode} 트리 노드 정보
     */
    public getNodeInfo = (id: string | number): TreeNode => {
        return this.config.allNode[id]
    }

    /**
     * check 아이템 얻기
     *
     * @returns check tree nodes
     */
    public getCheckValues() {
        return this.config.checkbox.getCheckValues()
    }

    /**
     * 전체 노드 열기
     */
    public allOpen() {
        this.config.rootNode.open(true)
    }

    /**
     * 전체 노드 닫기
     */
    public allClose() {
        this.config.rootNode.close(true)
    }

    /**
     * 노드 열기
     */
    public openNode(id: string | number) {
        const node = this.config.allNode[id]
        if (!node) {
            return
        }

        node.open()

        let pid = node.pid
        for (let depth = node.depth; depth > 0; depth--) {
            let pNode = this.config.allNode[pid]
            if (pNode && !pNode.isOpen) {
                pNode.open()
                pid = pNode.pid
            } else {
                break
            }
        }
    }

    /**
     *  노드 닫기
     */
    public closeNode(id: string | number) {
        const node = this.config.allNode[id]

        if (node) {
            node.close()
        }
    }

    /**
     * 트리 노드 정보 얻기
     *
     * @param id tree id
     * @returns  tree node 정보
     */
    public getNodes(id: string | number): TreeNode {
        if (isUndefined(id)) {
            return this.config.rootNode
        }
        return this.config.allNode[id]
    }

    /**
     * 노드 선택하기
     *
     * @param id tree id
     */
    public setSelectNode(id: string | number, isOpen: boolean = true) {
        const node = this.config.allNode[id]

        if (node) {
            if (isOpen) {
                this.openNode(id)
            }

            node.select()
        }
    }

    /**
     * 선택된 tree node 값 얻기.
     *
     * @returns {TreeNode} 선택된 tree node
     */
    public getSelectNodes(): TreeNode[] {
        const selectNodeList = this.rootElement.querySelectorAll('.dt-selected')
        if (selectNodeList) {
            const result: TreeNode[] = []
            for (let node of selectNodeList) {
                result.push(nodeUtils.elementToTreeNode(node, this))
            }
            return result
        }

        return []
    }

    /**
     *
     * @returns {TreeNode[]} check된 tree node 값
     */
    public getCheckNodes(): TreeNode[] {
        return this.config.checkbox.getCheckValues()
    }

    /**
     * 노드 삭제 하기.
     *
     * @param id tree node id
     * @returns 삭제된 노드 값
     */
    public remove(...ids: string[] | number[]) {
        const reval = []
        for (const id of ids) {
            const removeNode = this.config.allNode[id]

            if (removeNode) {
                reval.push(removeNode.remove())
            } else {
                reval.push(`id not found [${id}]`)
            }
        }
        return reval
    }

    /**
     * node count
     *
     * @public
     * @param {?(string|number)} [id] node id
     * @returns {number} count
     */
    public getTreeNodeCount(id?: string | number) {
        if (!id) {
            return nodeCount(this.config.rootNode) + (this.options.enableRootNode ? 1 : 0)
        } else {
            return nodeCount(this.config.allNode[id]) + 1
        }
    }

    /**
     * tree node search
     *
     * @public
     * @param {string} searchText search text
     * @param {?(string|number)} [id] node id 가 있을 경우 하위 노드 검색
     */
    public search(searchText: string, id?: string | number) {
        return this.config.search.search(searchText, id)
    }

    public destroy = () => {
        setAttribute(this.rootElement, { class: this.orginStyleClass, style: this.orginStyle })
        this.initContainerElement()

        for (const key in this) {
            if (hasOwnProp(this, key)) {
                delete this[key]
                delete ALL_INSTANCE[this.selector]
            }
        }
    }

    private initContainerElement() {
        const el = this.containerElement
        while (el.firstChild) {
            if (typeof el.firstChild.remove === 'function') {
                el.firstChild.remove() // DOM에서 제거
            } else {
                el.removeChild(el.firstChild)
            }
        }
    }
}

/**
 * node count 얻기
 *
 * @param {TreeNode} node tree
 * @returns {number} node count
 */
function nodeCount(node: TreeNode): number {
    if (node) {
        const childNodes = node.childNodes
        if (childNodes && childNodes.length > 0) {
            let childNodeCount = childNodes.length
            for (let treeNode of childNodes) {
                childNodeCount = childNodeCount + nodeCount(treeNode)
            }
            return childNodeCount
        }
    }
    return 0
}
