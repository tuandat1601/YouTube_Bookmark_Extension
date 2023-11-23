
let bookmarkBtnAdded = false;
let videoInfo = { type: "", url: "" }
let currentUrl = ''
var isModalVisible = false;
var acceptchange = 0
var timeseri = 0;
console.log("check 0 ", isModalVisible)
var modalOverlay = document.createElement('div');
modalOverlay.id = 'modalOverlay';
modalOverlay.style.cssText = 'display:none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 99;';

document.body.appendChild(modalOverlay);






if (document.querySelector('#modalOverlay div p span')) {
  timeseri = Number(document.querySelector('#modalOverlay div p span').textContent)
}
function updateVideoTime() {
  var videoElement = document.querySelectorAll('.video-stream')[0];
  if (videoElement) {

    timeseri = videoElement.currentTime;
    document.getElementById('currentTimeSpan').textContent = timeseri.toFixed(2)
    console.log('Current video time:', timeseri);
  }
}


var intervalId
document.addEventListener("click", function (event) {
  if (event.target.id === 'confirmButton') {
    acceptchange = 0
    setTimeout(() => {
      document.querySelector('video').play()
    }, 1000)
    console.log('Người dùng đã xác nhận');
    modalOverlay.style.display = 'none';
    isModalVisible = false;
    intervalId = setInterval(updateVideoTime, 3000);
  }
  if (event.target.id === 'cancelButton') {
    console.log('Người dùng không xác nhận và timeseri' + timeseri);
    acceptchange = 1
    window.history.back()
    document.querySelectorAll('.video-stream')[0].currentTime = timeseri
    modalOverlay.style.display = 'none';
    isModalVisible = false;



  }

});


chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {

  console.log("location ", window.location.href)
  if (acceptchange) {
    currentUrl = window.location.href
  }
  acceptchange = 0
  console.log("check1 ", isModalVisible)


  const { type, value, videoId, tabId } = obj;
  changeTabs(type)
  videoInfo.type = type
  videoInfo.url = videoId
  if (type === 'NEW') {
    timeseri = Number(document.querySelector('#modalOverlay div p span').textContent)
  }
  else if (!videoInfo.url.includes("https://www.youtube.com/watch") && window.location.href.includes("https://www.youtube.com/watch")) {
    if (document.querySelector('video')){

      document.querySelector('video').pause();
    }
    document.body.appendChild(modalOverlay);
    modalOverlay.style.display = 'block';
  }else{

  }
  console.log(currentUrl + " and  " + videoId)
  if (timeseri > 0) {
    document.querySelectorAll('.video-stream')[0].currentTime = timeseri
    console.log("show timeseri " + timeseri)
  }
  if (currentUrl !== videoId && currentUrl.includes("https://www.youtube.com/watch")) {
    isModalVisible = true
    console.log("show timeseri 2 " + timeseri)
    document.querySelectorAll('.video-stream')[0].currentTime = 0
  }
  if (!isModalVisible) {
    intervalId = setInterval(updateVideoTime, 3000);
  } else {
    clearInterval(intervalId)

  }

  if (currentUrl === '' || currentUrl === 'https://www.youtube.com/') {
    console.log("accept change ")
    currentUrl = videoInfo.url
  }
  else {
    console.log("currentUrl ", currentUrl)


    if (!currentUrl.includes("https://www.youtube.com/watch") && type === 'NEW') {
      console.log("change acc")
      currentUrl = videoInfo.url
    }

    else if (currentUrl.includes("https://www.youtube.com/watch") && type === 'NEW' && currentUrl !== videoInfo.url) {


      setTimeout(() => {
        document.querySelector('video').pause()
      }, 2000)
      console.log("check2 ", isModalVisible)

      isModalVisible = false;
      console.log(currentUrl)
      modalOverlay.style.display = 'block';
      clearInterval(intervalId)


    }
    else if (currentUrl.includes("https://www.youtube.com/watch") && type === 'NEW TAB') {

      currentUrl = videoInfo.url
      console.log("checj urk" + currentUrl)
    }

  }
  console.log("web info", type, value, videoInfo.url, tabId);

  if (type === "NEW" && !bookmarkBtnAdded) {
    videoLoad();
  } else if (type === "PLAY") {
    console.log(value)
    document.querySelectorAll('.video-stream')[0].currentTime = value;
  }


});


const videoLoad = async () => {
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
      console.log(newBookmark, totalTime)
      let linkvideo = videoInfo.url
      if (typeof linkvideo === 'string') {
        linkvideo = linkvideo.split('v=')

      } else {
        console.log('The variable does NOT store a string');
      }
      fetch('http://localhost:8080/videos/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',

        },
        body: JSON.stringify({ url: linkvideo[1], timecurrent: youtubePlayer.currentTime, totaltime: totalTime }),

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

const changeTabs = async (type) => {
  if (type === 'NEW TAB') {

    modalOverlay.innerHTML = ``
    modalOverlay.innerHTML = `
    <div class="confirmform
    " style = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
  <p style=" font-size: 24px;">Bạn có chắc chắn muốn rời khỏi Tab YouTube?</p>
     <button id="confirmChange" style ="background-color: #f87208;
     border: none;
     padding: 5px;
     border-radius: 5px;
     font-size: 18px;
     color: white;">Xác nhận</button>
     <button id="cancelChange" style ="background-color: #04f64a;
     border: none;
     padding: 5px;
     border-radius: 5px;
     font-size: 18px;
     color: white;">Hủy</button>
   
  </div>
  `
  }
  else {
    modalOverlay.innerHTML = ``
    modalOverlay.innerHTML = `
     
    <div class="confirmform
    " style = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
  <p style=" font-size: 24px;">Bạn có chắc chắn muốn rời khỏi video <span  id="currentTimeSpan">${timeseri}</span>?</p>
     <button id="confirmButton" style ="background-color: #f87208;
     border: none;
     padding: 5px;
     border-radius: 5px;
     font-size: 18px;
     color: white;">Xác nhận</button>
     <button id="cancelButton" style ="background-color: #04f64a;
     border: none;
     padding: 5px;
     border-radius: 5px;
     font-size: 18px;
     color: white;">Hủy</button>
   
  </div>
  `;
  }
}
