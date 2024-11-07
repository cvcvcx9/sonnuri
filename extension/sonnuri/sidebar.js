document.addEventListener("DOMContentLoaded", () => {
    chrome.runtime.sendMessage({ action: "get_saved_texts" }, (savedTexts) => {
      const container = document.getElementById("saved-content");
      container.innerHTML = savedTexts.map(text => `<p>${text}</p>`).join("");
    });
  });