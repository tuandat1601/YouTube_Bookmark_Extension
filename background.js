 async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}

let previousTabId = null;
let previousTabUrl = null;
function isYouTubeUrl(url) {
    return url.includes('youtube.com/watch');
  }
  

  async function handleTabUpdate(tabId, changeInfo, tab) {
    const activeTab = await getActiveTabURL();
   const previousurl = await moveTabs()
   console.log('YouTube tab detected tab:',  tab);
   if (changeInfo.status === 'loading' ||changeInfo.status === 'complete'  || activeTab.url ) {
      console.log(activeTab.url);
      

      console.log('YouTube tab detected activeTab.url:', activeTab.url);
      console.log('YouTube tab detected:', tabId);
      console.log('YouTube tab detected changeInfo:', changeInfo);
    
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        videoId: activeTab.url,
     previousurl :previousurl
      });
    }
  }
async function moveTabs(){

 await chrome.tabs.onActivated.addListener(function(activeInfo) {
 
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      if (previousTabId !== null && (previousTabId !== activeInfo.tabId || tab.url !== previousTabUrl)) {
       
        console.log("Tab ID or URL has changed!");
      }
      console.log("previousTabUrl is :", previousTabUrl);
   
      previousTabId = activeInfo.tabId;
      previousTabUrl = tab.url;
    
      console.log("Activated tab URL:", tab.url);
    } )   
    
   
    
  });
  return previousTabUrl
}
  
 
chrome.tabs.onUpdated.addListener(handleTabUpdate);

