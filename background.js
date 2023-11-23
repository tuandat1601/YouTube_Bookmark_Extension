 async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}

 let previousTabId = null;
   
  let previousTabUrl =null
  let youtubeTabId = null;
function isYouTubeUrl(url) {
    return url.includes('youtube.com/watch');
  }
  

  async function handleTabUpdate(tabId, changeInfo, tab) {
    const activeTab = await getActiveTabURL();
    console.log("previousTabUrl return :", previousTabUrl);
   console.log('YouTube tab detected tab:',  tab);
   
   if ( activeTab.url &&  changeInfo.status === 'complete'  ) {
      

      console.log('YouTube tab detected activeTab.url:', activeTab.url);
      console.log('YouTube tab detected:', tabId);
      console.log('YouTube tab detected changeInfo:', changeInfo);
  if (isYouTubeUrl(tab.url)){
    
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: activeTab.url,
      tabId:tabId
    });
  }
    }
  }

 
   chrome.tabs.onActivated.addListener(function(activeInfo) {
 
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      if (previousTabId !== null && (previousTabId !== activeInfo.tabId || tab.url !== previousTabUrl)) {
       
        console.log("Tab ID or URL has changed!");
          if(!isYouTubeUrl(tab.url)){
            
            chrome.tabs.sendMessage(previousTabId, {
              type: "NEW TAB",
              videoId:tab.url,
              
              tabId:tab.id
            });
          }       
      }
      console.log("previousTabUrl is :", previousTabUrl);
   
      previousTabId = activeInfo.tabId;
      previousTabUrl = tab.url; 
      console.log("Activated tab URL:", tab.url);
      console.log("Activated tab ID :", previousTabId);
    } )   
  });

 

 
chrome.tabs.onUpdated.addListener(handleTabUpdate);
// chrome.tabs.update(1283789847, { active: true });
