const socket = io()

const chatForm = document.getElementById("chat-form")
const messagesContainer = document.querySelector(".chat-messages")

const leaveButton = document.getElementById("leave-btn")

const roomName = document.getElementById("room-name")
const usersList = document.getElementById("users")


function outputMsg(obj) {
    const div = document.createElement('div')

    const container = document.querySelector(".chat-messages")
    div.classList.add('message')

    div.innerHTML = `<p class='meta'>${obj.username}
    <span>${obj.time}</span></p><p class='text'>${obj.text}</p>`
    container.appendChild(div)
}

function outputRoom(room){
    roomName.innerText = room
}

function outputUsersList(users){
    usersList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `
}


socket.on("message", (data) => {
    outputMsg(data)

    messagesContainer.scrollTop = messagesContainer.scrollHeight
})

const params = new URLSearchParams(window.location.search)
const token = params.get("token")

if (token) {
    localStorage.setItem("token", token)
}

socket.emit("joinRoom", token)

leaveButton.addEventListener("click", () => {
    const leaveRoom = confirm("Are you sure want to leave this chat?")
    if (leaveRoom) {
        window.location = "../"
    }
})

socket.on("usersInRoom", (data) => {
    outputRoom(data.room)
    outputUsersList(data.usersList)
})

chatForm.addEventListener("submit", (e) => {
    e.preventDefault()
    let messageText = e.target.elements.msg.value
    e.target.elements.msg.value = ""
    e.target.elements.msg.focus()

    socket.emit("chatMsg", { messageText, token });
})


const emojibtn = document.querySelector('#emoji-btn');
const picker = new EmojiButton();
picker.on('emoji', emoji => {
    document.querySelector('#msg').value += emoji;
});

emojibtn.addEventListener('click', () => {
    picker.togglePicker(document.getElementById('msg'));
});








