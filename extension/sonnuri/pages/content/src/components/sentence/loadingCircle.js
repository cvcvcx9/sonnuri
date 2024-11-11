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
        div.style.justifyContent = "center";
    }

    circle.stop = ()=>{
        circle.classList.remove("loading");
        circle.classList.add("stop");
        div.style.display = "none";
    }

    circle.success = ()=>{
        circle.classList.remove("loading");
        circle.classList.add("success");
    }
    
    circle.error = ()=>{
        circle.classList.remove("loading");
        circle.classList.add("error");
    }

    div.appendChild(circle);

    div.onclick = ()=>{
        console.log("loading circle clicked");
    }

    document.body.appendChild(div);
    
    return {div,circle};
}
