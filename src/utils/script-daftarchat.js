// Menangani klik tombol kirim
document.querySelector('.sendBtn').addEventListener('click', function() {
    const message = document.querySelector('.chat-input input').value;
    if (message.trim()) {
        const chatBox = document.querySelector('.chat-messages');
        const userMessage = document.createElement('div');
        userMessage.classList.add('chat-message', 'user');
        userMessage.innerHTML = `<p>${message}</p>`;
        chatBox.appendChild(userMessage);
        document.querySelector('.chat-input input').value = ''; // Clear input
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
    }
});

// Menangani klik tombol verifikasi
document.querySelector('.btn-verify').addEventListener('click', function() {
    alert("Verifikasi tindakan telah dilakukan!");
});
