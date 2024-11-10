export default function findTextNodes(element) {
  const textNodes = [];
  const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: function (node) {
      // 보이는 텍스트만 선택
      if (
        node.textContent.trim() &&
        getComputedStyle(node.parentElement).display !== 'none' &&
        getComputedStyle(node.parentElement).visibility !== 'hidden'
      ) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_REJECT;
    },
  });

  let node;
  while ((node = walk.nextNode())) {
    textNodes.push(node);
  }
  return textNodes;
}
