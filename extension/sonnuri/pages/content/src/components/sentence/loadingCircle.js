export default function loadingCircle() {
    const div = document.createElement("div");
    
    div.id = "loading-circle-container";
    const circle = document.createElement("span");
    circle.id = "loading-circle";
    const signImg = document.createElement("img");
    signImg.src = chrome.runtime.getURL("content/img/sign-language.png");
    signImg.style.width = "24px";
    signImg.style.height = "24px";
    div.appendChild(signImg);

    circle.classList.add("loader");
    circle.classList.add("stop");

    circle.loading = ()=>{
        circle.classList.add("loading");
        circle.classList.remove("stop");
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.backgroundColor = "orange";
        div.style.justifyContent = "center";
    }

    circle.stop = ()=>{
        circle.classList.remove("loading");
        circle.classList.add("stop");
        div.style.backgroundColor = "orange";
        div.style.display = "none";
    }

    circle.success = ()=>{
        circle.classList.remove("loading");
        div.style.backgroundColor = "green";
    }
    div.onclick = ()=>{
            chrome.runtime.sendMessage({type: "open_side_panel"});
            circle.stop();
    }
    
    circle.error = ()=>{
        circle.classList.remove("loading");
        div.style.backgroundColor = "red";
    }

    div.appendChild(circle);
    
    document.body.appendChild(div);
    
    return {div,circle};
}
