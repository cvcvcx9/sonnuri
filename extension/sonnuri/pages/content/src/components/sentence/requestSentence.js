export default async function requestSentence(text, circle) {
    circle.loading();
    try{   
    const response = await fetch("http://k11a301.p.ssafy.io:8001/determine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },  
        body: JSON.stringify({ text: text }),
      });
       const data = await response.json();
       return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setTimeout(() => {
            circle.stop();
        }, 30000);

    }
  
  await chrome.storage.local.set({ newSentence: text });
}

