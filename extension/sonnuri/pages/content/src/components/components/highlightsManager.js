let highlights = [];

export function getHighlights() {
  return highlights;
}

export function setHighlights(newHighlights) {
  highlights = newHighlights;
}

export function addHighlight(highlight) {
  highlights.push(highlight);
}

export function clearHighlights() {
  highlights = [];
}
