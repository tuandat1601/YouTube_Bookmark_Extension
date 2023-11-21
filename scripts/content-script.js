
let bookmarkBtnAdded = false;
let   videoInfo = {type:"",url:""}
let listBookMark = []
let acceptChange = 0;
let currentUrl=''
let timeseri =null
let eventt=null
document.addEventListener("click", function(event) {
  eventt=event
  timeseri = document.querySelectorAll('.video-stream')[0].currentTime
  console.log(timeseri)
  
});
chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
  const { type, value, videoId} = obj;
  videoInfo.type=type
  videoInfo.url=videoId
  console.log(currentUrl)
  
 if (currentUrl===''||currentUrl==='https://www.youtube.com/'){
  currentUrl = videoInfo.url
 }
 else {
  console.log(currentUrl)
 
 
  if (!currentUrl.includes("https://www.youtube.com/watch") && type==='NEW'){
    currentUrl = videoInfo.url
  }
 
  else if (currentUrl.includes("https://www.youtube.com/watch") && type==='NEW'&&currentUrl!==videoInfo.url ){
    console.log(currentUrl)
  
  if(!checkChangeTabs(timeseri)){
    window.location.href = "#";
  }else{  

  currentUrl = videoInfo.url
}
   
  }
  else if (currentUrl.includes("https://www.youtube.com/watch") && type==='NEW TAB'){

    currentUrl = videoInfo.url
    console.log(currentUrl)
  }

 }
  console.log("web info",type, value, videoInfo.url);

  if (type === "NEW" && !bookmarkBtnAdded) {
    videoLoad();
  }else if (type === "PLAY") {
    console.log(value)
    document.querySelectorAll('.video-stream')[0].currentTime = value;}


});
const getListBookmarks = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([currentVideo], (obj) => {
      resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
    });
  });
};
const checkChangeTabs = (timeseri)=>{
  if (confirm("Bạn muốn rời video ở thòi gian "+ timeseri)) {
    txt = "Đồng ý!";
  } else {
    txt = "Từ chối!";
    return false;
  }
}
const videoLoad = async ()=>{
  const bookmarkBtn = document.createElement("img");
  bookmarkBtn.src = chrome.runtime.getURL("assets/images/bookmark.png");
  bookmarkBtn.className = "ytp-button " + "bookmark-btn";
  bookmarkBtn.title = "Click to bookmark current timestamp";
  const youtubeLeftControls = document.querySelector(".ytp-left-controls")
  const youtubePlayer = document.querySelectorAll('.video-stream')[0];
  if (youtubeLeftControls) {
    youtubeLeftControls.appendChild(bookmarkBtn);
    bookmarkBtn.addEventListener("click", function (event) {
      event.preventDefault();
      const totalTime = document.querySelector('.ytp-time-duration').textContent

      const newBookmark = { url: videoInfo.url, timecurrent: youtubePlayer.currentTime };
      console.log(newBookmark,totalTime)
      let linkvideo = videoInfo.url
      if (typeof linkvideo === 'string') {
        linkvideo=linkvideo.split('v=')
       
      } else {
        console.log('The variable does NOT store a string');
      }
      

      fetch('http://localhost:8080/videos/update', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        
        },
        body: JSON.stringify({url:linkvideo[1] ,timecurrent: youtubePlayer.currentTime,totaltime:totalTime}),
     
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
   
        console.log('Video saved successfully:', data);
    })
    .catch(error => {
  
        console.error('Error saving video:', error);
    });
      });

    
    bookmarkBtnAdded = true; 
  } 
  

}


// let previousTabId = null;
// let previousTabUrl = null;
// chrome.tabs.onActivated.addListener(function(activeInfo) {
 
//   chrome.tabs.get(activeInfo.tabId, function(tab) {
//     if (previousTabId !== null && (previousTabId !== activeInfo.tabId || tab.url !== previousTabUrl)) {
     
//       console.log("Tab ID or URL has changed!");
//     }
//     console.log("previousTabUrl is :", previousTabUrl);
 
//     previousTabId = activeInfo.tabId;
//     previousTabUrl = tab.url;
  
//     console.log("Activated tab URL:", tab.url);
//   } )   
  
 
  
// });


  