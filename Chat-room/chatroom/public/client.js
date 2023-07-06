(function () {
    const app = document.querySelector('.app');
    const socket = io();

    let feedback = document.getElementById('feedback');

    let room = document.getElementById('room');

    let userName = document.getElementById("user-name");

    let uname;

    app.querySelector(".join-screen #join-user").addEventListener('click', function () {

        let username = app.querySelector('.join-screen #username').value;
        if (username.length == 0) {
            return;
        }
        socket.emit('newuser', username);
        uname = username;
        // userName.innerText = username;

        if(document.getElementById("profile") != null){
            document.getElementById("profile").innerHTML += '<i class="fa-solid fa-user"></i>' + username;
        }


        app.querySelector('.join-screen').classList.remove("active");
        app.querySelector('.chat-screen').classList.add("active");

        //login emitted
        socket.emit("login", username);
    })

    app.querySelector('.chat-screen #send-message').addEventListener("click", function () {
        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length == 0) {
            return;
        }
        renderMessage('my', {
            username: uname,
            text: message
        });

         let users = document.querySelectorAll('.user');

         let recipientUser;
            users.forEach(user => {
                if(user.classList.contains("activeChat")){
                   return recipientUser = user;
                }
            });

        socket.emit("chat", {
            username: uname,
            text: message,
            recipientUserID: recipientUser.id,
        });

        app.querySelector('.chat-screen #message-input').value = '';
    })

    app.querySelector('.chat-screen #exit-chat').addEventListener("click", function (e) {
        e.preventDefault()

        socket.emit('exituser', uname);

        socket.emit('log-out', uname)

        app.querySelector('.join-screen #username').value = '';

        app.querySelector('.join-screen').classList.add("active");
        app.querySelector('.chat-screen').classList.remove("active");
    })

    app.querySelector('.chat-screen #message-input').addEventListener("input", function () {
        let message = app.querySelector(".chat-screen #message-input").value;
        let username = app.querySelector('.join-screen #username').value;
        
        socket.emit('typing', username, message)
    })

    //Listening for events
    socket.on("update", function (update) {
        renderMessage('update', update)
    })

    // socket.on("chat", function (message) {
    //     feedback.innerHTML = ''
    //     renderMessage('other', message)
    // })

    socket.on("typing", function (username, message) {
        message !== "" ? feedback.innerHTML = `${username} is typing...` : feedback.innerHTML = ''
    })

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('userDisconnected', ({ disconnectedUser, disconnectedUserID }) => {
        console.log(`${disconnectedUser} Disconnected from server`);
        removeUserFromList(disconnectedUserID);
    });

    socket.on('connectedUsers', (data) => {
        processArray(data)

        let users = document.querySelectorAll('.user');
        users.forEach(user => {
            user.addEventListener('click', () => {
                openChatPage(user);
                users.forEach(user => {
                    user.classList.remove('activeChat');
                });
                user.classList.add('activeChat');
            });
        });
    })
  
    socket.on('new_private_message',(data)=>{
        // console.log(data);
        const message = data.message;
        const sender = data.sender;
        feedback.innerHTML = ''
        renderMessage('private', {message,sender})
    })

    // document.addEventListener('click', (event) => {
    //     if (event.target.classList.contains('user')) {
    //         const recipientId = event.target.id;
    //         const message = document.getElementById("message-input").value;


    //         socket.emit('privateMessage', { recipientId, message });
    //     }
    // });

    function renderMessage(type, message) {
        // console.log(message);
        const messageContainer = app.querySelector('.chat-screen .messages');
        let messageClass = '';
        let messageContent = '';
      
        if (type === 'my') {
          messageClass = 'message my-message';
          messageContent = `
            <div>
              <div class='name'>You</div>
              <div class='text'>${message.text}</div>
            </div>
          `;
        } else if (type === 'other') {
          messageClass = 'message other-message';
          messageContent = `
            <div>
              <div class='name'>${message.username}</div>
              <div class='text'>${message.text}</div>
            </div>
          `;
        } else if (type === 'update') {
          messageClass = 'update';
          messageContent = message;
        }else if (type === 'private') {
            messageClass = 'message other-message';
            messageContent = `
              <div>
                <div class='name'>${message.sender}</div>
                <div class='text'>${message.message}</div>
              </div>
            `;
          }
        const messageElement = document.createElement('div');
        messageElement.setAttribute('class', messageClass);
        messageElement.innerHTML = messageContent;
      
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
      }

    function processArray(arr) {
        arr.forEach(({id,username}) => {
            addUserToList(id, username);
        });
    }

    // function recipientUser(event) {
    //     if (event.target.classList.contains('user')) {
    //         const recipientId = event.target.id;
    //     }
    //     return recipientId;
    // }

    function addUserToList(userID, username) {
        let users= document.querySelector(".users");
        users.innerHTML = "";
        const usersContainer = document.querySelector(".users-container");
        // console.log(users);
        const userItem = document.createElement('div');
        userItem.innerText = username;
        userItem.setAttribute("class", "user");
        userItem.setAttribute("id", `${userID}`);
        users.appendChild(userItem);
        usersContainer.appendChild(userItem);
    }

    function removeUserFromList(userId) {
        const usersContainer = document.querySelector(".users-container");
        const userItem = document.getElementById(userId);
        if (usersContainer && userItem) {
            usersContainer.removeChild(userItem);
        }
    }

    function openChatPage(user) {
        const welcomePage = document.querySelector(".welcome-page");
        welcomePage.style.display='none';
        const chatPage = document.querySelector('.messages-container')
        chatPage.style.display = 'flex';
        document.getElementById("user-name").innerText = user.innerText;
    }
})();






