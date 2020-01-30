var nameList = ["Jyoti", "Kritika", "Harry", "Casey", "Neel", "Joey"];
var newDiscussion;
var idCount = 0;
var discussionsData = [];
var discussionsList = "";
fetchData();
updateTime();

function fetchData() {
    if(localStorage.length === 0) {
        localStorage.setItem("discussionsData", JSON.stringify(discussionsData));
        localStorage.setItem("idCount", JSON.stringify(idCount));
        localStorage.setItem("discussionList", JSON.stringify(discussionsList));

    } else {
        discussionsData = JSON.parse(localStorage.getItem("discussionsData"));
        idCount = JSON.parse(localStorage.getItem("idCount"));
        discussionsList = (JSON.parse(localStorage.getItem("discussionList"))).replace(/\\"/g, '"');
        discussionsList = discussionsList.replace(/\\n/g,"");
        console.log(discussionsData);
    }
    loadHtml();
}

function loadHtml() {
    const div = document.getElementById("dynamic-data");
    div.innerHTML = discussionsList;
}

function updateLocalStorage(div) {
    localStorage.setItem("discussionsData", JSON.stringify(discussionsData));
    localStorage.setItem("idCount", JSON.stringify(idCount));
    localStorage.setItem("discussionList", JSON.stringify(div));
}

function updateTime() {
    var timeDiff;
    const dateObj = new Date();
    const currentTime = dateObj.getTime();
    const elt = document.getElementsByClassName("time");
    var arr = Array.prototype.slice.call(elt);
    arr && arr.forEach(function(item){
        timeDiff = Math.floor((currentTime - item.attributes[1].value) / 1000);
        if(timeDiff === 1) {
            item.innerText = `${timeDiff} sec ago`;
        } else if(timeDiff > 1 && timeDiff < 60) {
            item.innerText = `${timeDiff} secs ago`;
        } else if(timeDiff > 60 && timeDiff < 3600) {
            timeDiff = Math.floor(timeDiff / 60);
            if(timeDiff === 1) {
                item.innerText = `${timeDiff} min ago`;
            } else {
                item.innerText = `${timeDiff} mins ago`;
            }
        } else if(timeDiff > 3600 && timeDiff < 216000) {
            timeDiff = Math.floor(timeDiff / 3600);
            if(timeDiff === 1) {
                item.innerText = `${timeDiff} hour ago`;
            }else {
                item.innerText = `${timeDiff} hours ago`;
            }
        } else if(timeDiff > 216000) {
            timeDiff = Math.floor(timeDiff / 216000);
            if(timeDiff === 1) {
                item.innerText = `${timeDiff} day ago`; 
            }else {
                item.innerText = `${timeDiff} days ago`;
            }
        } 
    });
}

function hideReply(e) {
    if(e.className === "input-reply") {
        e.className = "input-reply input-reply-hide";
    }
}

function replyToDiscussion(id) {
    const replyInput = `<input 
        id="${id}-input"
        class="input-reply" 
        type="text"
        placeholder="Reply to discussion ..."
        onkeydown="startDiscussion(this,${id})"
        onfocusout="hideReply(this)">`;
    let parent = document.getElementById(id);
    if(parent.children.length > 3 && parent.children[3].className === "discussion-reply") {
        parent.children[3].children[0].className = "input-reply";
    } else {
        let newDiv = document.createElement('div');
        newDiv.innerHTML = replyInput;
        newDiv.className = "discussion-reply";
        parent.appendChild(newDiv);
    }
    document.getElementById(`${id}-input`).focus();
}

function footerAction(e) {
    var obj = discussionsData[e.id];
    event.stopPropagation();
    if(event.srcElement.className === "upvote") {
        obj.count++;
    } else if(event.srcElement.className === "downvote" && obj.count > 0) {
        obj.count--;
    } else if(event.srcElement.className === "reply") {
        replyToDiscussion(e.id);
        return;
    }
    e.children[2].firstElementChild.innerText = `${discussionsData[e.id].count}`;
    updateLocalStorage(document.getElementById("dynamic-data").innerHTML);
}

function generateRandomName(arrSize) {
    const randomName = nameList[Math.floor(Math.random() * arrSize)];
    return randomName;
}

function createNewEntry(id, name, time, content, count) {
    const obj = {
        id: id,
        name: name,
        time: time,
        content: content,
        count: count,
    }
    discussionsData[`${id}`] = obj;
}

function createNewDiscussion(id, callingClass, parentId) {
    const obj = discussionsData[id];
    var createDiscussion = `
    <header class="discussion-header">
        <label class="name">${obj.name}</label>
        <label class="time" data-create-time="${(new Date().getTime())}"> just now</label>
    </header>
    <div class="discussion-content">
        <label class="content">${obj.content}</label>
    </div>
    <footer class="discussion-footer">
        <label class="vote-counts">${obj.count}</label>
        <button class="upvote"> V</button>
        <button class="downvote"> V</button>
        <button class="reply"> reply</button>
    </footer>`;

    var newdiv = document.createElement('div');
    newdiv.id = `${idCount++}`;
    newdiv.innerHTML = createDiscussion;
    newdiv.setAttribute("onclick", "footerAction(this)");
    
    var parentDiv;
    if(callingClass === "input-reply input-reply-hide") {
        newdiv.className = "discussion-reply";
        parentDiv = document.getElementById(parentId);
    } else {
        newdiv.className = "discussion";
        parentDiv = document.getElementsByClassName("discussions-list")[0];
    }
    parentDiv.appendChild(newdiv);

    updateTime();
    updateLocalStorage(document.getElementById("dynamic-data").innerHTML);
}

function startDiscussion(e, parentId) {
    if(event.keyCode === 13) {
        if(e.value === "") return;
        newDiscussion = e.value;
        if(e.className === "input-reply") {
            e.className = "input-reply input-reply-hide";
        }
        const name = generateRandomName(nameList.length);
        createNewEntry(idCount, name, "", newDiscussion, 0);
        createNewDiscussion(idCount, e.className, parentId);
        e.value = "";
        
    }
}