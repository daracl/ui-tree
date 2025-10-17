import { TreeNode } from '@t/TreeNode'

import { Tree } from './Tree'
import nodeUtils from './util/nodeUtils'
import { isString } from './util/utils'
import { Options } from '@t/Options';
/**
 *TreeNodeRenderer
 *
 * @export
 * @class TreeNodeRenderer
 */
export class TreeNodeRenderer {
	private nodeStyleFn;
	private tree: Tree;

	private enableIcon: boolean;

	private isCheckbox:boolean;

	constructor(tree: Tree, options: Options) {
			this.nodeStyleFn = options.nodeStyleClass??null;
			this.tree = tree;

			this.enableIcon = tree.options.enableIcon ?? false;

			this.isCheckbox = tree.config.isCheckbox;
	}

    
	/**
	 * create node element
	 *
	 * @export
	 * @param {TreeNode} renderNode treenode
	 * @param {string} style style
	 * @param {boolean} openFlag tree open 여부
	 * @param {?boolean} [rootFlag] root node 여부
	 * @returns {HTMLElement}
	 *
	 * 이 메소드는 단일 트리 노드(li)를 생성합니다. 텍스트는 안전하게 textContent로 설정되며,
	 * 아이콘/확장자(expander) 등은 DOM API를 이용해 생성합니다.
	 * rootFlag가 false이면 노드를 드래그 가능(draggable)으로 설정합니다.
	 */
	public createNodeElement(renderNode: TreeNode, style: string, openFlag:boolean, rootFlag?: boolean): HTMLElement {

		const liElement = document.createElement('li');
		liElement.setAttribute('data-dt-id', renderNode.id+"");
		if(openFlag) liElement.className = "dt-open";

		const nodeElement = document.createElement('div');
		nodeElement.className = "dt-node";
		nodeElement.style.cssText = style;
		if(!rootFlag){
			nodeElement.setAttribute('draggable',"true");
		}

		nodeElement.appendChild(this.nodeContentHtml(renderNode));

		liElement.appendChild(nodeElement);

		return liElement; 
	}

	public createChildNodeElement(renderNode: TreeNode): HTMLElement {
		const ulElement = document.createElement('ul');
		ulElement.className ="dt-children";
		return ulElement;
	}

	
	/**
	 * getNodeRender
	 *
	 * 주어진 노드의 자식들을 재귀적으로 탐색하여 DocumentFragment 형태로 반환합니다.
	 * 반환된 DocumentFragment는 안전하게 DOM에 appendChild로 삽입할 수 있습니다.
	 *
	 * @param {TreeNode} node - 렌더링할 노드
	 * @returns {DocumentFragment} 생성된 노드 조각
	 */
	public getNodeRender( node: TreeNode): DocumentFragment {
		const nodeFragmentElement = document.createDocumentFragment();

		let childNodes = node?.childNodes ?? this.tree.config.rootNode.childNodes;
		
		const childLength = childNodes.length;

		node.renderChildLength = childLength;

		if(childLength < 1) return nodeFragmentElement;

		let stylePaddingLeft = childLength > 0 ? nodeUtils.textContentPadding(childNodes[0].depth, this.tree) : 0
		
		for (let i = 0; i < childLength; i++) {
				let childNode = childNodes[i]

				const childNodeLength = childNode.getChildLength();

				const liElement = this.createNodeElement(childNode, `padding-left:${stylePaddingLeft}px`, childNode.isOpen);

				if(childNode.isOpen && childNodeLength > 0){
					const ulElement = this.createChildNodeElement(childNode);
					ulElement.appendChild(this.getNodeRender(childNode));
					liElement.appendChild(ulElement);	
				}

				nodeFragmentElement.appendChild(liElement);
		}
		
		return nodeFragmentElement;
	}

	/**
	 * 트리 노드 생성
	 *
	 * @param {TreeNode} node - 내용 생성을 위한 노드
	 * @returns {HTMLElement} 내용을 담은 span 요소
	 */
	private nodeContentHtml(node: TreeNode) {
		const span = document.createElement('span');

		span.appendChild(this.getExpandIconHtml(node));

		this.getNodeNameHtml(span, node);

		return span;
	}

	/**
	 * 노드의 확장/축소 icon 요소 생성
	 *
	 * @param {TreeNode} node - 아이콘 상태 판단을 위한 노드
	 * @returns {HTMLElement} 확장 아이콘 요소
	 */
	private getExpandIconHtml(node: TreeNode) : HTMLElement {
		const expandElement = document.createElement('i');
		expandElement.className =`dt-expander ${nodeUtils.isFolder(node) ? 'dt-visible' : ''}`;

		return expandElement; 
	}

	/**
	 * 트리 노드 아이콘 이름 생성
	 *
	 * @param {HTMLSpanElement} contentSpanElement - 내용을 추가할 부모 span
	 * @param {TreeNode} node - 노드 데이터
	 * @returns {HTMLSpanElement} 업데이트된 contentSpanElement
	 */
	private getNodeNameHtml(contentSpanElement: HTMLSpanElement, node: TreeNode) {
		
		// add check box 
		if (this.isCheckbox) {
			const checkElement = document.createElement('span');
			checkElement.className = 'dt-checkbox dt-icon';
			contentSpanElement.appendChild(checkElement);
		}

		let addNodeStyleClass = '';
		if (this.nodeStyleFn) {
				addNodeStyleClass = this.nodeStyleFn(node);
				if (!isString(addNodeStyleClass)) {
						addNodeStyleClass = '';
				}else{
					addNodeStyleClass = ' '+addNodeStyleClass.trim();
				}
		}

		// title element
		const nodeTitleElement = document.createElement('span');
		nodeTitleElement.className	= 'dt-node-title'+ addNodeStyleClass;

		// node icon
		if (this.enableIcon) {
			const icon  = document.createElement('i');
			icon.className = `dt-icon ${nodeUtils.getIcon(node)}`;
			nodeTitleElement.appendChild(icon);
		}

		const nodeText = document.createElement('span');
		nodeText.textContent = node.text;

		nodeTitleElement.appendChild(nodeText);
		contentSpanElement.appendChild(nodeTitleElement);

		return contentSpanElement;
	}
}
