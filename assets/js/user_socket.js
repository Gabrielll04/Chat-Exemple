import { Socket } from "phoenix"

let socket = new Socket("/socket", { params: { token: window.userToken } })

let chatInput = document.querySelector("#chat-input")
let messagesContainer = document.querySelector("#messages")
let userName = document.querySelector("#user-name")

socket.connect()

let channel = socket.channel("room:lobby", {})

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

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

export default socket