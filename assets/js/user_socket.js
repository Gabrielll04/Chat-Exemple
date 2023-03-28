import { Socket, Presence } from "phoenix"

let socket = new Socket("/socket", { params: { token: window.userToken } })

let chatInput = document.querySelector("#chat-input")
let messagesContainer = document.querySelector("#messages")
let userName = document.querySelector("#user-name")

function renderOnlineUsers(presence) {
  let response = ""

  presence.list((id, {metas: [first, ...rest]}) => {
    let count = rest.length + 1
    response += `<br>${id} (count: ${count})</br>`
  })

  document.querySelector("#main").innerHTML = response
}

socket.connect()

let channel = socket.channel("room:lobby", {name: window.location.search.split("=")[1]})
let presence = new Presence(channel)

chatInput.addEventListener("keypress", event => {
  if (event.key === 'Enter') {
    const body = { user_name: userName.value, body: chatInput.value }
    channel.push("new_msg", body)
    chatInput.value = ""
  }
})

channel.on("new_msg", payload => {
  let messageItem = document.createElement("p")
  messageItem.innerText = `[${Date()}]: ${payload.user_name}: ${payload.body}`
  messagesContainer.appendChild(messageItem)
})

chatInput.addEventListener("keyup", event => {
  if (event.target.value !== "") {
    channel.push("typing", { user_name: userName.value })
  }
})

channel.on("typing", payload => {
  let typingMessage = document.querySelector("#typing-message")
  typingMessage.innerText = `${payload.user_name} is typing...`
  setTimeout(() => { typingMessage.innerText = "" }, 2000)
})

presence.onSync(() => renderOnlineUsers(presence))

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

export default socket