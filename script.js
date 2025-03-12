// Function to display generated code in the code container
function displayCode(code) {
    const codeOutput = document.getElementById("code-output");
    codeOutput.textContent = code;
    hljs.highlightElement(codeOutput); // Apply syntax highlighting
}

// Function to copy code to clipboard
function copyCode() {
    const codeOutput = document.getElementById("code-output");
    navigator.clipboard.writeText(codeOutput.textContent);
    alert("Code copied to clipboard!");
}

// Function to toggle code editing
function toggleCodeEditing() {
    const codeOutput = document.getElementById("code-output");
    codeOutput.contentEditable = !codeOutput.isContentEditable;
    const editButton = document.getElementById("edit-code-btn");
    editButton.textContent = codeOutput.isContentEditable ? "💾 Save Edits" : "✏️ Edit Code";
}

// Function to send a message to the chatbot
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
        // Get the selected model
        const model = document.getElementById("model-select").value;

        // Send the user's message to the Flask backend
        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: message, model: model }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch bot response");
        }

        const data = await response.json();

        // Display the bot's reply in the chat window
        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot");

        // Check if the response contains code (wrapped in triple backticks)
        if (data.response.includes("```")) {
            const code = data.response.split("```")[1]; // Extract code
            botMessage.innerHTML = `<pre><code class="hljs">${code}</code></pre>`;
            hljs.highlightElement(botMessage.querySelector("code")); // Apply syntax highlighting
            displayCode(code); // Display code in the code container
        } else {
            botMessage.textContent = data.response;
        }

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

    // Get existing saved chats or initialize an empty array
    let savedChats = JSON.parse(localStorage.getItem("savedChats")) || [];
    const chatName = `Chat ${savedChats.length + 1}`; // Default name for the chat

    // Add the new chat to the savedChats array
    savedChats.push({ name: chatName, chat: chatHistory });

    // Save the updated array back to localStorage
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

    // Add event listener for the Copy Code button
    document.getElementById("copy-code-btn").addEventListener("click", copyCode);

    // Add event listener for the Edit Code button
    document.getElementById("edit-code-btn").addEventListener("click", toggleCodeEditing);

    // Load saved chats list when the page loads
    updateSavedChatsList();
});  document.getElementById("user-input").addEventListener("touchend", sendMessage);