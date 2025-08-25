import openai
import os
import dotenv
from datetime import datetime
import json

dotenv.load_dotenv("./.env")

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_current_date():
    """
    Get the current date in the format YYYY-MM-DD
    Inputs:
        None
    Returns:
        str: The current date in the format YYYY-MM-DD
    """
    return datetime.now().strftime("%Y-%m-%d")

def get_current_weather(date: str, city: str):
    """
    Get the current weather in a given city
    Inputs:
        date: str
        city: str
    Returns:
        str: The current weather in the given city
    """
    return f"The weather in {city} is sunny on {date}"


messages = [
    # {"role": "user", "content": "What is the current date and weather in Tokyo?"},
    {"role": "user", "content": "What is the current date?"}
]

response = client.chat.completions.create(
    model="gpt-5-mini",
    messages=messages,
    tools=[
        {
            "type": "function",
            "function": {
                "name": "get_current_date",
                "description": "Get the current date",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "additionalProperties": False
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_current_weather",
                "description": "Get the current weather in a given city at given date",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "date": {"type": "string", "description": "The date to get the weather for"},
                        "city": {"type": "string", "description": "The city to get the weather for"}
                    },
                    "required": ["date", "city"],
                    "additionalProperties": False
                }
            }
        }
    ],
)

# print(response.choices[0].message.content)
# print(response.to_json(indent=2))

available_functions = {
    "get_current_date": get_current_date,
    "get_current_weather": get_current_weather
}

for choice in response.choices:
    if choice.message.tool_calls:
        for tool_call in choice.message.tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            function = available_functions[function_name]
            function_response = function(**function_args)
            print(function_response)