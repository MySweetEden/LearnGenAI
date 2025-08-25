import operator
from typing import Annotated, Any

from pydantic import BaseModel, Field


class State(BaseModel):
    query: str = Field(..., description="The user's query")
    current_role: str = Field(default="", description="Chosen role")
    messages: Annotated[list[str], operator.add] = Field(
        default=[], description="Chat history"
    )
    current_judge: bool = Field(
        default=False, description="Whether the quality of the answer is good"
    )
    judgement_reason: str = Field(
        default="", description="The reason for the judgement"
    )


# StateGraphを作成
from langgraph.graph import StateGraph

workflow = StateGraph(State)

# プロンプトを作成
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("""
Role: {role}

Query: {query}
""")

# 環境変数を読み込み、モデルを作成
import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=api_key)


from langchain_core.runnables import RunnablePassthrough

selection_node = RunnablePassthrough.assign(
    query=lambda state: state.query,
    role=lambda state: state.current_role,
)


def selection_node(state: State) -> dict[str, Any]:
    query = state.query
    role = state.current_role
    generated_message = "hogehogefugafuga"
    return {"messages": [generated_message]}


def answering_node(state: State) -> dict[str, Any]:
    query = state.query
    role = state.current_role
    generated_message = "hogehogefugafuga"
    return {"messages": [generated_message]}


# answering_node = (
#     RunnablePassthrough.assign(
#         query=lambda state: state.query,
#         role=lambda state: state.current_role,
#     )
#     | prompt
#     | llm
#     | StrOutputParser()
#     | RunnablePassthrough.assign(messages=lambda state: [state])
# )


def check_node(state: State) -> dict[str, Any]:
    query = state.query
    message = state.messages[-1]

    # Simple placeholder judgement: always accept
    judge = True if (len(query) > 0) and (len(message) > 0) else False
    reason = (
        "Accepted by placeholder judge" if judge else "Rejected by placeholder judge"
    )

    return {"current_judge": judge, "judgement_reason": reason}


workflow.add_node("selection", selection_node)
workflow.add_node("answering", answering_node)
workflow.add_node("check", check_node)

workflow.set_entry_point("selection")
workflow.add_edge("selection", "answering")
workflow.add_edge("answering", "check")

from langgraph.graph import END

workflow.add_conditional_edges(
    "check", lambda state: state.current_judge, {True: END, False: "selection"}
)

compiled = workflow.compile()

initial_state = State(query="Why is the sky blue?")

result = compiled.invoke(initial_state)

print(result)
