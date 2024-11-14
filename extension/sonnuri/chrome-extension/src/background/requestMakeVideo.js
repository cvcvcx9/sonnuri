export default async function requestMakeVideo(urls) {
    // 같은 주소로 요청이 가고있는게 있다면 취소하기
    if (requestMakeVideo.abortController) {
        requestMakeVideo.abortController.abort();
        console.log("요청 취소");
    }
    const abortController = new AbortController();
    requestMakeVideo.abortController = abortController;

    try{
            const response = await fetch("http://k11a301.p.ssafy.io:8003/process_videos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ video_urls: urls }),
            signal: abortController.signal,
        })
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    } 
}