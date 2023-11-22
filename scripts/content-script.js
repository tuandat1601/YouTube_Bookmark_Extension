
let bookmarkBtnAdded = false;
let   videoInfo = {type:"",url:""}
let listBookMark = []
let acceptChange = 0;
let currentUrl=''
let timeseri =null


let eventt=null


  var modalOverlay = document.createElement('div');
  modalOverlay.id = 'modalOverlay';
  modalOverlay.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 99;';
 
  // Thêm phần tử vào body của trang
  document.body.appendChild(modalOverlay);


// Biến để theo dõi trạng thái của modal
var isModalVisible = false;
document.addEventListener("mousemove", function(event) {
  eventt = event
 })
document.addEventListener("click", function(event) {
  eventt = event
  timeseri = document.querySelectorAll('.video-stream')[0].currentTime
  if (isModalVisible){
    event.preventDefault();
  }
  if (event.target.id === 'confirmButton') {
    
    console.log('Người dùng đã xác nhận');


    modalOverlay.style.display = 'none';
    isModalVisible = false;
}
  if (event.target.id === 'cancelButton') {
    event.preventDefault();
    console.log('Người dùng không xác nhận');

    
    modalOverlay.style.display = 'none';
    isModalVisible = false;
}
  
});
 window.addEventListener('beforeunload', function (event) {
      if (isModalVisible) {
          event.preventDefault();
          event.returnValue = '';
      }
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
    modalOverlay.innerHTML = `
     
    <div style = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
 <p>Bạn có chắc chắn muốn rời khỏi video ${timeseri}?</p>
     <button id="confirmButton">Xác nhận</button>
     <button id="cancelButton">Hủy</button>
   
 </div>
`;
  isModalVisible = true;
    
    console.log(currentUrl)
    modalOverlay.style.display = 'block';
   
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
function checkChangeTabs(timeseri){
  if (confirm("Bạn muốn rời video ở thòi gian "+ timeseri)) { 
    return true
  } else {
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


  