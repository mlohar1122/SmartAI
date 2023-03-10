import bot from './assets/bot.svg'
import user from './assets/user.svg'

const HTMLfrom = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element){
  element.textContent =''

  loadInterval =  setInterval(() => {
    element.textContent +='.';
    if (element.textContent == '....') {
      element.textContent='';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0
  let interval = setInterval(() => {
      if (index < text.length) {
          element.innerHTML += text.charAt(index)
          index++
      } else {
          clearInterval(interval)
      }
  }, 20)
}

function genrateUniqueId(){
  const timeStamp = Date.now();
  const randomNUmber = Math.random();
  const hexadecimalString = randomNUmber.toString(16);
  return `id-${timeStamp}-${hexadecimalString}`;
}

function chatStripe(isAi,value,uniqueId){
  return(`<div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
          <div class="profile">
              <img 
                src=${isAi ? bot : user} 
                alt="${isAi ? 'bot' : 'user'}" 
              />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
      </div>
  </div>`)
}

const handleSubmit = async(e)=>{
    e.preventDefault();

    const data = new FormData(HTMLfrom);
    console.log(data)
    //user chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
    HTMLfrom.reset();

    //bot chatstripe
    const uniqueId = genrateUniqueId();
    chatContainer.innerHTML += chatStripe(true,"",uniqueId);
    //put new message into view
    chatContainer.scrollTop = chatContainer.scrollHeight;
    const messageDiv = document.getElementById(uniqueId);
    loader(messageDiv);

    //fatch data from server bot responce

    const response = await fetch('https://smartai-sojb.onrender.com/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML = "";

  if (response.ok) {
     
      const data = await response.json();
      const parsedData = data.bot.trim();
      typeText(messageDiv, parsedData)
  } else {
      const err = await response.text()
      messageDiv.innerHTML = "Something went wrong"
      alert(err)
  }
}

HTMLfrom.addEventListener('submit', handleSubmit);
HTMLfrom.addEventListener('keyup',(e)=>{
  if(e.keyCode === 13){
    handleSubmit(e);
  }
})