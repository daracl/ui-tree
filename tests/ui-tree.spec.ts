import { test, expect, Page } from '@playwright/test';

test.describe('ui-tree component', () => {
  // 트리 페이지로 이동
  test.beforeEach(async ({ page }) => {
    await page.goto('/');  // 경로는 앱 설정에 맞게 변경
  });

  // helper: 노드 요소 가져오기
  async function getNodeElement(page: Page, nodeId: string) {
    // 예: data-node-id 속성 사용한다고 가정
    return page.locator(`[data-dt-id="${nodeId}"]`);
  }

  test('renders root and children nodes', async ({ page }) => {
    // 예: 루트 노드 id = "0"
    const root = await getNodeElement(page, '0');

    await expect(root).toBeVisible();
    await expect(root).toHaveText(/Root Menu 1/i);

    // 자식 노드 중 하나 확인 (예: id = "1")
    const child = await getNodeElement(page, '6');
    await expect(child).toBeVisible();
    // 텍스트가 Root Menu 2 등인지 확인
    await expect(child).toHaveText(/Root Menu 2/i);
  });

  test('expand / collapse node', async ({ page }) => {
    const node = await getNodeElement(page, '0');

    // 이 노드가 collapsed 상태면 expand 버튼이 있을 것
    const toggle = node.locator('>.dt-node>.dt-expander');  
    // 또는 toggle 버튼 selector는 실제 코드 확인 필요

    // 클릭해서 확장
    await toggle.click();
    // 확장 후 자식 노드가 보여야 함 (예: id = "3")
    const grandChild = await getNodeElement(page, '1');

    await expect(grandChild).toBeVisible();
  
    // 다시 클릭해서 접기
    await toggle.click();
    await expect(grandChild).not.toBeVisible();
  });

  test('checkbox toggle works', async ({ page }) => {
    // 예: node id = "5" 에 체크박스가 있음
    const node5 = await getNodeElement(page, '12');
    const checkbox = node5.locator('>.dt-node>.dt-checkbox');

    // 토글해서 체크
    await checkbox.click();

    let classes = await checkbox.getAttribute("class");

    expect(classes?.split(' ')).toContain('dt-checked');
    // 다시 클릭해서 체크 해제
    await checkbox.click();

    classes = await checkbox.getAttribute("class");

    expect(classes?.split(' ')).not.toContain('dt-checked');
  });

  test('click node triggers selection callback', async ({ page }) => {
    const node = await getNodeElement(page, '6');

    const nodeTitle = node.locator('>.dt-node>.dt-node-title');

    // 클릭
    await nodeTitle.click();
    // 내부 구현에서 선택된 노드 스타일 변경 또는 클래스 변경이 있을 테니 그것 확인
    await expect(nodeTitle).toHaveClass(/selected/);
    // 또는 selection 콜백이 내부적으로 DOM 어딘가 상태를 바꾼다면 그 변화 확인
  });

  test('double-click node triggers dblclick callback', async ({ page }) => {
    const node = await getNodeElement(page, '6');

    const nodeTitle = node.locator('>.dt-node>.dt-node-title');
    await nodeTitle.dblclick();
    // 더블 클릭 시 어떤 동작이 있어야 한다면 그 UI 변화 확인
    // 예: 클래스 변경, 문구 변경, 입력 활성화 등
    // 아래는 예시:
    await expect(nodeTitle).toHaveClass(/edit/);
  });

});
