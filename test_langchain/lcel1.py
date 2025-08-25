from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv("./.env")

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant that can answer questions and help with tasks."),
    ("user", "Please correct me if I use incorrect expressions.\n{sentence}"),
])

api_key = os.getenv("OPENAI_API_KEY", "OPENAI_API_KEY")
llm = ChatOpenAI(model="gpt-5-mini", api_key=api_key)

# LCEL (LangChain Expression Language)
chain = prompt | llm | StrOutputParser()

response = chain.invoke({"sentence": "I want to know the whether in Tokyo."})

print(response)