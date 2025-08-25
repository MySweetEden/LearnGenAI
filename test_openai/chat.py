import openai
import os
import dotenv
import time

dotenv.load_dotenv("./.env")

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

STREAM_MODE = True

messages = [
    {"role": "user", "content": "How are you?"},
]

response = client.chat.completions.create(
    model="gpt-5-mini",
    messages=messages,
    stream=STREAM_MODE,
)

if STREAM_MODE:
    for chunk in response:
        print(chunk.choices[0].delta.content, end="", flush=True)
        time.sleep(0.1)
    print()
else:
    print(response)

# print(response.to_json(indent=2))
# print(response.choices[0].message.content)

# print(response)
# print("I want to know when this line is printed")

