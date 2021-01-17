chrome.tabs.query({
    currentWindow: true,
    active: true
}, function(tab) {
    chrome.storage.sync.get(['pages'], function(res){
        var pages = res.pages;
        if( pages != undefined ){
            var bool = true;
            for(let item of pages){
                if(item.url == tab[0].url){
                    bool = false;
                }
            }
            if(bool){
                pages.unshift(tab[0]);
                if(pages.length > 6){
                    pages.pop();
                }
                chrome.storage.sync.set(
                    {
                        "pages": pages
                    }
                )
            }
            loadPages();
        } else {
            chrome.storage.sync.set(
                {
                    "pages": tab
                }
            );
            loadPages();
        }
    })
});

var logo = document.getElementById("doc");
logo.addEventListener("click", ()=>{
    if(logo.getAttribute("src") == "favorite.png"){
        logo.setAttribute("src", "current.png");
        document.getElementsByClassName("content-container")[0].style.display="initial";
        document.getElementsByClassName("favorite-container")[0].style.display="none";
    } else {
        logo.setAttribute("src", "favorite.png");
        document.getElementsByClassName("content-container")[0].style.display="none";
        document.getElementsByClassName("favorite-container")[0].style.display="initial";
        loadFavorite();
    }
})

function loadPages(){
    chrome.storage.sync.get(['pages'], function(res){
        document.getElementsByClassName('content-container')[0].innerHTML = "";
        for(let item of res.pages){
            document.getElementsByClassName('content-container')[0].innerHTML += `
            <div class="content-page" data-link="${item.url}">
                <div class="star">
                    <img src="yellow-star.png">
                </div>
                <div class="content">
                    <img class="content-icon" src="${item.favIconUrl}">
                    <div class="content-title">
                        <div>
                        ${item.title}
                        </div>
                    </div>
                </div>
            </div>`
            var content = document.getElementsByClassName("content-page");
            for(let obj of content){
                obj.addEventListener('click', function(e){
                    if(e.path[0].tagName == "DIV"){
                        chrome.tabs.create({
                            'url':obj.getAttribute('data-link')
                        })
                    } else if(e.path[0].tagName == "IMG"){
                        var currentPage = {
                            url: e.path[2].getAttribute("data-link"),
                            favIconUrl: e.path[2].children[1].children[0].getAttribute("src"),
                            title: e.path[2].children[1].children[1].innerText
                        }
                        chrome.storage.sync.get(['favorite'], function(res){
                            var favorite = res["favorite"];
                            if(favorite != null){
                                if(!favorite.includes(currentPage)){
                                    favorite.push(currentPage);
                                    if(favorite > 6){
                                        favorite.shift()
                                    }
                                    chrome.storage.sync.set({
                                        'favorite': favorite
                                    })
                                }
                            } else {
                                chrome.storage.sync.set({
                                    'favorite': [currentPage]
                                });
                            }
                        })
                    }
                })
            }
        }
    })
}

function loadFavorite(){
    chrome.storage.sync.get(["favorite"], function(res){
        document.getElementsByClassName('favorite-container')[0].innerHTML = "";
        for(let item of res["favorite"]){
            document.getElementsByClassName('favorite-container')[0].innerHTML += `
            <div class="content-page" data-link="${item.url}">
                <div class="star">
                    <img src="trash.png">
                </div>
                <div class="content">
                    <img class="content-icon" src="${item.favIconUrl}">
                    <div class="content-title">
                        <div>
                        ${item.title}
                        </div>
                    </div>
                </div>
            </div>`
        }
        var content = document.getElementsByClassName("content-page");
        for(let obj of content){
            obj.addEventListener('click', function(e){
                if(e.path[0].tagName == "DIV"){
                    chrome.tabs.create({
                        'url':obj.getAttribute('data-link')
                    })
                } else if(e.path[0].tagName == "IMG"){
                    var currentPage = {
                        url: e.path[2].getAttribute("data-link"),
                        favIconUrl: e.path[2].children[1].children[0].getAttribute("src"),
                        title: e.path[2].children[1].children[1].innerText
                    }
                    chrome.storage.sync.get(['favorite'], function(res){
                        favorite = res["favorite"];
                        var index = 0;
                        for(let item of favorite){
                            if(item.url == currentPage.url){
                                break;
                            }
                            index++;
                        }
                        favorite.splice(index, 1);
                        chrome.storage.sync.set({
                            "favorite": favorite
                        }, function(){
                            loadFavorite();
                        })
                    })
                }
            })
        }
    })
}