# ドキュメントをロードして処理するために必要なモジュールをインポート
import re

from langchain.prompts import ChatPromptTemplate
from langchain_community.document_loaders import GitLoader

# GitLoaderを初期化して、リポジトリをクローンし、特定のブランチとパスからドキュメントをロード
# 'diaryContents'ディレクトリ内のHTMLファイルを抽出する


def file_filter(file_name: str) -> bool:
    return (
        re.match(
            r"^\.\/test_langchain\/kakutory_diary\/public\/diaryContents\/\d{10}\.html$",
            file_name,
        )
        is not None
    )


loader = GitLoader(
    clone_url="https://github.com/Suke-H/Kakutory",
    repo_path="./test_langchain/kakutory_diary",
    branch="main",
    file_filter=file_filter,
)
raw_docs = loader.load()
print(f"length of raw_docs: {len(raw_docs)}")

# ドキュメントを小さなチャンクに分割する
from langchain_text_splitters import CharacterTextSplitter

text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(raw_docs)
print(f"lenght of docs: {len(docs)}")

# 環境変数を読み込み、埋め込みを作成する
import os

from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings

load_dotenv("./.env")
api_key = os.getenv("OPENAI_API_KEY", "OPENAI_API_KEY")
embeddings = OpenAIEmbeddings(model="text-embedding-3-small", api_key=api_key)

# ドキュメントからベクトルデータベースを作成する
# 埋め込みを使用してドキュメントチャンクからChromaデータベースを作成
from langchain_chroma import Chroma

db = Chroma.from_documents(docs, embedding=embeddings)
retriever = db.as_retriever()

# ドキュメントデータベースで検索するクエリを定義
query = "Wordleとはなんですか？"
vector = embeddings.embed_query(query)

print(f"length of vector: {len(vector)}")

# データベースからクエリに関連するコンテキストドキュメントを取得
context_docs = retriever.invoke(query)

print(f"length of context_docs: {len(context_docs)}")

# # 取得されたコンテキストドキュメントから最初のドキュメントにアクセス
# # 最初のドキュメントのメタデータと内容を出力
# first_doc = context_docs[0]
# print(f"metadata: {first_doc.metadata}")
# print(f"page_content: {first_doc.page_content}")

# チャットプロンプトとモデルを作成する
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template('''¥
以下の文脈だけを踏まえて質問に回答して。

文脈："""
{context}
"""

質問：{question}
''')

# 特定のモデルとAPIキーでチャットモデルを初期化
model = ChatOpenAI(model="gpt-5-mini", api_key=api_key)

# 出力解析とチェーンの実行を行う
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# コンテキスト、プロンプト、モデル、出力解析を処理する
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
output = chain.invoke(query)


# チェーンからの最終出力を出力
print(output)
