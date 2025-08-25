from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import itertools
import os


load_dotenv("./.env")

api_key = os.getenv("OPENAI_API_KEY", "OPENAI_API_KEY")
llm = ChatOpenAI(model="gpt-5-mini", api_key=api_key)

prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a helpful, concise assistant. If the user's English has mistakes, kindly correct them while answering."
    ),
    MessagesPlaceholder(variable_name="history"),
    ("user", "{input}"),
])

chain = prompt | llm | StrOutputParser()


def main() -> None:
    print("Type 'exit' or 'quit' to end the chat.\n")
    history: list = []

    try:
        for _turn_index in itertools.count(1):
            user_text = input("You: ").strip()
            if user_text.lower() in {"exit", "quit"}:
                print("Goodbye!")
                break

            response_text = chain.invoke({
                "input": user_text,
                "history": history,
            })

            print(f"Assistant: {response_text}")

            # Keep long conversation context
            history.append(HumanMessage(content=user_text))
            history.append(AIMessage(content=response_text))

    except (KeyboardInterrupt, EOFError):
        print("\nGoodbye!")


if __name__ == "__main__":
    main()