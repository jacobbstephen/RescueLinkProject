#import basics
import fitz  # PyMuPDF
import time
import os
from dotenv import load_dotenv

#import langchain   
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

#import from pine cone
from pinecone import Pinecone, ServerlessSpec

#load the API key
load_dotenv()
pinecone_API_Key = os.getenv("PINECONE_API_KEY")
pinecone_Environment = os.getenv("PINECONE_ENVIRONMENT")
openAI_API_Key = os.getenv("OPENAI_API_KEY")
index_name = os.getenv("PINECONE_INDEX_NAME")

pc = Pinecone(api_key=pinecone_API_Key)

# Check whether index already exists, if not create it
existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

if index_name not in existing_indexes:
    pc.create_index(
        name=index_name,
        dimension=3072,  # Match this with your OpenAI embeddings output size
        metric="cosine",  # Consistent with your embedding model
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
    while not pc.describe_index(index_name).status["ready"]:
        time.sleep(1)

index = pc.Index(index_name)

# Initialize the embedding and vector store
embeddings = OpenAIEmbeddings(model="text-embedding-3-large", openai_api_key=openAI_API_Key)
vector_store = PineconeVectorStore(index=index, embedding=embeddings)

# Loading the PDF directly
pdf_path = "DisasterPocketBook.pdf"

# Use PyMuPDFLoader to load the PDF text
loader = PyMuPDFLoader(pdf_path)
docs = loader.load()

# Ensure data is loaded correctly
assert len(docs) > 0  
print(f"Total pages loaded: {len(docs)}")

# Splitting the document
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=400,
    length_function=len,
    is_separator_regex=False,
)

# Split the text into chunks
all_splits = text_splitter.split_documents(docs)

print(f"Split Document into {len(all_splits)} sub-documents.")

# Generate unique IDs
uuids = [f"id{i+1}" for i in range(len(all_splits))]

# Store documents and embeddings
vector_store.add_documents(all_splits, ids=uuids)

print("Documents stored in Pinecone successfully!")























# #import basics
# import pymupdf4llm
# import pathlib
# import time
# import os
# from dotenv import load_dotenv

# #import langchain   


# from langchain_community.document_loaders import UnstructuredMarkdownLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_core.documents import Document
# from langchain_openai import OpenAIEmbeddings
# from langchain_pinecone import PineconeVectorStore

# #import from pine cone
# from pinecone import Pinecone, ServerlessSpec

# #load the API key
# load_dotenv()
# pinecone_API_Key = os.getenv("PINECONE_API_KEY")
# pinecone_Environment = os.getenv("PINECONE_ENVIRONMENT")
# openAI_API_Key = os.getenv("OPENAI_API_KEY")
# index_name = os.getenv("PINECONE_INDEX_NAME")






# pc = Pinecone(api_key=pinecone_API_Key)

# #check whether index alreadyt exist, if not create it
# existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

# if index_name not in existing_indexes:
#     pc.create_index(
#         name=index_name,
#         dimension=3072,  # Match this with your OpenAI embeddings output size
#         metric="cosine",  # Consistent with your embedding model
#         spec=ServerlessSpec(cloud="aws", region="us-east-1")
#     )
#     while not pc.describe_index(index_name).status["ready"]:
#         time.sleep(1)
        
        
# index = pc.Index(index_name)



# #intialise the embedding and vector store

# embeddings = OpenAIEmbeddings(model="text-embedding-3-large",openai_api_key=openAI_API_Key)
# vector_store = PineconeVectorStore(index = index,embedding= embeddings)

# #loading the pdf

# pdf_path = "DisasterPocketBook.pdf"
# markdown_path = "DisasterPocketBook.md"

# #convert document to markdown format
# docs = pymupdf4llm.to_markdown(pdf_path)

# #save the extracted content as markdown file
# pathlib.Path(markdown_path).write_bytes(docs.encode())

# #load the markdown file using UnstructuredMarkdownLoader
# loader  = UnstructuredMarkdownLoader(markdown_path)
# docs = loader.load()

# assert len(docs) == 1  # Ensure data is loaded correctly
# print(f"Total characters extracted: {len(docs[0].page_content)}")

# #splitting the document

# text_splitter = RecursiveCharacterTextSplitter(
#     chunk_size=800,
#     chunk_overlap=400,
#     length_function=len,
#     is_separator_regex=False,
# )

# #split the text into chunks
# all_splits = text_splitter.split_documents(docs)

# # Print details
# print(f"Split Document into {len(all_splits)} sub-documents.")


# # generate unique id's

# i = 0
# uuids = []

# while i < len(all_splits):

#     i += 1

#     uuids.append(f"id{i}")




# # Store documents and embeddings
# vector_store.add_documents(all_splits, ids=uuids)

# print("Documents stored in Pinecone successfully!")

# # # Check number of stored vectors
# # index_stats = index.describe_index_stats()
# # print(f"Total vectors stored: {index_stats['total_vector_count']}")
