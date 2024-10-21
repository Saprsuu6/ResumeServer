# WebSocket API

## Пример использования WebSocket с Socket.IO

Вот пример JavaScript-кода для подключения к серверу WebSocket через библиотеку Socket.IO:

```html
<script>
  // Подключение к серверу Socket.IO
  const socket = io('http://localhost:3000');

  // Прослушивание события 'receiveMessage' от сервера
  socket.on('receiveMessage', (message) => {
    const messagesList = document.getElementById('messages');
    const messageItem = document.createElement('li');
    messageItem.textContent = `${message.sender}: ${message.content} (${new Date(message.timestamp).toLocaleString()})`;
    messagesList.appendChild(messageItem);
  });
</script>
```
