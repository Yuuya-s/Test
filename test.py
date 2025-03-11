import ollama

def chat_with_mistral():
    print("🤖 Mistral Chatbot (type 'exit' to quit)\n")
    
    while True:
        user_input = input("You: ")
        if user_input.lower() == "exit":
            print("👋 Goodbye!")
            break

        response = ollama.chat(model="mistral", messages=[{"role": "user", "content": user_input}])
        print("Mistral:", response["message"]["content"])

chat_with_mistral()
