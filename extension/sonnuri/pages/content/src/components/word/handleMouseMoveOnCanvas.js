import hideVideoModal from "./hideVideoModal";

let previousHoveredHighlight = null;

export default function handleMouseMoveOnCanvas(e, highlights, modal, showVideoModal) {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const hoveredHighlight = highlights.find(
    highlight =>
      mouseX >= highlight.rect.left &&
      mouseX <= highlight.rect.right &&
      mouseY >= highlight.rect.top &&
      mouseY <= highlight.rect.bottom,
  );

  if (hoveredHighlight) {
    if (hoveredHighlight !== previousHoveredHighlight) {
      showVideoModal(hoveredHighlight, mouseX, mouseY, modal);
    }
    previousHoveredHighlight = hoveredHighlight;
  } else {
    const isMouseOutsideAllHighlights = highlights.every(
      highlight =>
        mouseX < highlight.rect.left ||
        mouseX > highlight.rect.right ||
        mouseY < highlight.rect.top ||
        mouseY > highlight.rect.bottom,
    );

    if (isMouseOutsideAllHighlights) {
      hideVideoModal(modal);
      previousHoveredHighlight = null;
    }
  }
}
