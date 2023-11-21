

const bookmarkList = document.getElementById("bookmarkList");

async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
    const activeTab = tabs[0];
    
    if (activeTab) {
      return activeTab.url;
    } else {
      return null;
    }
  }
  async function getActiveTabID() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
    return tabs[0].id;
}



document.addEventListener("DOMContentLoaded",  async function () {
  
    const activeUrl = await getActiveTabURL();
    let url = activeUrl.split('v=')[1]
    const item = document.createElement("div");
   let timecurrent=0
    item.className='onPlay'
    const response=  await fetch(`http://localhost:8080/videos/${url}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        return response.json();
    })
    .then(data => {  
      console.log(data.timecurrent)
      item.textContent =`${Math.round((data.timecurrent/60),2)}:${Math.round(data.timecurrent%60,0)} / ${data.totaltime}` 
      timecurrent=data.timecurrent
    })
    .catch(error => {
        console.error('Error getting video:', error);
    });
 
      bookmarkList.appendChild(item);
       item.addEventListener('click',async ()=> {
       const tabsid = await getActiveTabID()
          chrome.tabs.sendMessage(tabsid   , {
              type: "PLAY",
              value: timecurrent,
            });
        });

  })
  
