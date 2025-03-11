// Function to send a message
async function sendMessage() {
    const inputField = document.getElementById("user-input");
    const message = inputField.value.trim();
    if (message === "") return;

    const chatWindow = document.getElementById("chat-window");

    // Display the user's message in the chat window
    const userMessage = document.createElement("div");
    userMessage.classList.add("message", "user");
    userMessage.textContent = message;
    chatWindow.appendChild(userMessage);

    // Clear the input field
    inputField.value = "";

    // Scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        // Send the user's message to the Flask backend
        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: message }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch bot response");
        }

        const data = await response.json();

        // Display the bot's reply in the chat window
        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot");
        botMessage.textContent = data.response;
        chatWindow.appendChild(botMessage);

        // Scroll to the bottom of the chat window
        chatWindow.scrollTop = chatWindow.scrollHeight;
    } catch (error) {
        console.error("Error:", error);

        // Display an error message in the chat window
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("message", "bot");
        errorMessage.textContent = "Sorry, something went wrong. Please try again.";
        chatWindow.appendChild(errorMessage);

        // Scroll to the bottom of the chat window
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

// Function to save the chat to localStorage
function saveChat() {
    const chatWindow = document.getElementById("chat-window");
    const chatHistory = chatWindow.innerHTML; // Save the entire chat history as HTML
    const chatName = `Chat ${savedChats.length + 1}`; // Default name for the chat

    // Get existing saved chats or initialize an empty array
    const savedChats = JSON.parse(localStorage.getItem("savedChats")) || [];
    savedChats.push({ name: chatName, chat: chatHistory }); // Add the new chat
    localStorage.setItem("savedChats", JSON.stringify(savedChats));

    alert("Chat saved successfully!");
    updateSavedChatsList(); // Refresh the sidebar list
}

// Function to delete a saved chat
function deleteChat(index) {
    const savedChats = JSON.parse(localStorage.getItem("savedChats")) || [];
    savedChats.splice(index, 1); // Remove the chat at the specified index
    localStorage.setItem("savedChats", JSON.stringify(savedChats));

    alert("Chat deleted successfully!");
    updateSavedChatsList(); // Refresh the sidebar list
}

// Function to rename a saved chat
function renameChat(index, newName) {
    const savedChats = JSON.parse(localStorage.getItem("savedChats")) || [];
    if (savedChats[index]) {
        savedChats[index].name = newName; // Update the chat name
        localStorage.setItem("savedChats", JSON.stringify(savedChats));
        updateSavedChatsList(); // Refresh the sidebar list
    }
}

// Function to load a saved chat
function loadChat(index) {
    const savedChats = JSON.parse(localStorage.getItem("savedChats")) || [];
    if (savedChats[index]) {
        const chatWindow = document.getElementById("chat-window");
        chatWindow.innerHTML = savedChats[index].chat; // Load the saved chat
    } else {
        alert("No saved chat found.");
    }
}

// Function to update the saved chats list in the sidebar
function updateSavedChatsList() {
    const savedChatsList = document.getElementById("saved-chats-list");
    savedChatsList.innerHTML = ""; // Clear the list

    const savedChats = JSON.parse(localStorage.getItem("savedChats")) || [];
    savedChats.forEach((chat, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = chat.name;

        // Create dropdown menu
        const dropdown = document.createElement("div");
        dropdown.classList.add("dropdown");

        // Dropdown button
        const dropdownBtn = document.createElement("button");
        dropdownBtn.classList.add("dropdown-btn");
        dropdownBtn.textContent = "⋮"; // Ellipsis icon
        dropdown.appendChild(dropdownBtn);

        // Dropdown content
        const dropdownContent = document.createElement("div");
        dropdownContent.classList.add("dropdown-content");

        // Rename option
        const renameButton = document.createElement("button");
        renameButton.textContent = "✏️ Rename";
        renameButton.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent loading the chat when renaming
            openRenameModal(index);
        });

        // Delete option
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️ Delete";
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent loading the chat when deleting
            deleteChat(index);
        });

        dropdownContent.appendChild(renameButton);
        dropdownContent.appendChild(deleteButton);
        dropdown.appendChild(dropdownContent);

        listItem.appendChild(dropdown);
        savedChatsList.appendChild(listItem);
    });
}

// Function to open the rename modal
function openRenameModal(index) {
    const modal = document.getElementById("rename-modal");
    const renameInput = document.getElementById("rename-input");
    const savedChats = JSON.parse(localStorage.getItem("savedChats")) || [];

    // Set the current chat name in the input field
    renameInput.value = savedChats[index].name;

    // Show the modal
    modal.style.display = "flex";

    // Save the new name when the save button is clicked
    document.getElementById("rename-save-btn").onclick = () => {
        const newName = renameInput.value.trim();
        if (newName) {
            renameChat(index, newName);
            modal.style.display = "none";
        } else {
            alert("Please enter a valid name.");
        }
    };

    // Close the modal when the close button is clicked
    document.querySelector(".close-modal").onclick = () => {
        modal.style.display = "none";
    };

    // Close the modal when clicking outside of it
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
}

// Function to start a new chat
function startNewChat() {
    const chatWindow = document.getElementById("chat-window");
    chatWindow.innerHTML = ""; // Clear the chat window
}

// Function to toggle the sidebar
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

// Function to toggle dark and light mode
function toggleDarkMode() {
    const body = document.body;
    const themeToggle = document.getElementById("theme-toggle");

    // Toggle between dark-mode and light-mode
    if (body.classList.contains("dark-mode")) {
        body.classList.replace("dark-mode", "light-mode");
        localStorage.setItem("theme", "light-mode");
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        body.classList.replace("light-mode", "dark-mode");
        localStorage.setItem("theme", "dark-mode");
        themeToggle.textContent = "🌙 Dark Mode";
    }
}

// Initialize theme based on localStorage
function initializeTheme() {
    const body = document.body;
    const themeToggle = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme");

    // Apply saved theme or default to dark-mode
    if (savedTheme === "light-mode") {
        body.classList.replace("dark-mode", "light-mode");
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        body.classList.add("dark-mode");
        themeToggle.textContent = "🌙 Dark Mode";
    }
}

// Add event listeners
document.addEventListener("DOMContentLoaded", () => {
    initializeTheme(); // Set the initial theme
    document.getElementById("theme-toggle").addEventListener("click", toggleDarkMode);

    // Add event listener for the send button
    document.getElementById("send-btn").addEventListener("click", sendMessage);

    // Add event listener for the Enter key in the input field
    document.getElementById("user-input").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    // Add event listener for the New Chat button
    document.getElementById("new-chat-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to start a new chat? Any unsaved changes will be lost.")) {
            startNewChat();
        }
    });

    // Add event listener for the Save Chat button
    document.getElementById("save-chat-btn").addEventListener("click", saveChat);

    // Add event listener for the Toggle Saved Chats button
    document.getElementById("toggle-saved-chats").addEventListener("click", toggleSidebar);

    // Load saved chats list when the page loads
    updateSavedChatsList();
});