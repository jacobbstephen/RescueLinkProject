from fastapi import FastAPI, HTTPException
import os
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.prompts import PromptTemplate
from pinecone import Pinecone
from pydantic import BaseModel

# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

# Initialize FastAPI
app = FastAPI()

# Connect to Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# Load vector store and embeddings
embeddings = OpenAIEmbeddings(model="text-embedding-3-large", openai_api_key=OPENAI_API_KEY)
vector_store = PineconeVectorStore(index=index, embedding=embeddings)
retriever = vector_store.as_retriever(search_type="similarity_score_threshold", search_kwargs={"k": 5, "score_threshold": 0.5})

# Define LLM model
llm = ChatOpenAI(model_name="gpt-4o", temperature=0.5, openai_api_key=OPENAI_API_KEY)

# Define prompt template
template = """
You are a disaster response assistant. Answer the user's question using the retrieved disaster guidelines.

Guidelines:
- Provide clear and concise responses based only on the retrieved knowledge.
- Do not use bold text, special symbols, or extra formatting.
- Structure the response in simple sentences or bullet points.
- If no relevant information is found, respond with:  
  "I couldn't find relevant information in my knowledge base."

---

User's Question:  
{query}

Retrieved Disaster Guidelines:  
{results}

Response:
"""

prompt = PromptTemplate.from_template(template)
chain = prompt | llm 

# Function to format retrieved documents
def format_docs(docs):
    return "\n\n".join([doc.page_content for doc in docs])

# API endpoint to get chatbot response



# Define request model
class ChatRequest(BaseModel):
    query: str

@app.post("/chat")
def get_chat_response(request: ChatRequest):
    try:
        retrieved_docs = retriever.invoke(request.query)  # Use request.query
        context = format_docs(retrieved_docs)
        
        if not context.strip():
            return {"response": "I couldn't find relevant information in my knowledge base."}
        
        response = chain.invoke({"query": request.query, "results": context})
        return {"response": response.content if hasattr(response, "content") else response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the API using uvicorn (Command: uvicorn filename:app --reload)























# # Import required libraries
# import os
# from dotenv import load_dotenv

# # LangChain modules
# from langchain_pinecone import PineconeVectorStore
# from langchain_openai import OpenAIEmbeddings
# from langchain_openai import ChatOpenAI
# from langchain.prompts import PromptTemplate

# # Pinecone for vector storage
# from pinecone import Pinecone

# # Load environment variables
# load_dotenv()
# pinecone_API_Key = os.getenv("PINECONE_API_KEY")
# openAI_API_Key = os.getenv("OPENAI_API_KEY")
# index_name = os.getenv("PINECONE_INDEX_NAME")

# # Connect to Pinecone
# pc = Pinecone(api_key=pinecone_API_Key)

# # Load the Pinecone index
# index = pc.Index(index_name)

# # Print vector store stats
# stats = index.describe_index_stats()
# print(f"Total vectors stored: {stats['total_vector_count']}")

# # Load the OpenAI embedding model
# embeddings = OpenAIEmbeddings(model="text-embedding-3-large", openai_api_key=openAI_API_Key)

# # Load the vector store
# vector_store = PineconeVectorStore(index=index, embedding=embeddings)

# print("Vector store loaded successfully!")

# # Setup the retriever
# retriever = vector_store.as_retriever(
#     search_type="similarity_score_threshold",
#     search_kwargs={"k": 5, "score_threshold": 0.5},
# )

# # Define LLM Model
# llm = ChatOpenAI(model_name="gpt-4o", temperature=0.5, openai_api_key=openAI_API_Key)

# # Improved Prompt Template for Clean Responses
# template = """
# You are a disaster response assistant. Answer the user's question using the retrieved disaster guidelines.

# Guidelines:
# - Provide clear and concise responses based only on the retrieved knowledge.
# - Do not use bold text, special symbols, or extra formatting.
# - Structure the response in simple sentences or bullet points.
# - If no relevant information is found, respond with:  
#   "I couldn't find relevant information in my knowledge base."

# ---

# User's Question:  
# {query}

# Retrieved Disaster Guidelines:  
# {results}

# Response:
# """


# # Create prompt template object
# prompt = PromptTemplate.from_template(template)

# # Define the RAG chain
# chain = prompt | llm 

# # Function to format retrieved documents
# def format_docs(docs):
#     return "\n\n".join([doc.page_content for doc in docs])

# # Function to generate chatbot response
# def generate_response(query):
#     retrieved_docs = retriever.invoke(query)  # Retrieve relevant disaster guidelines
#     context = format_docs(retrieved_docs)  # Format retrieved text

#     # If no relevant documents are found, return a default message
#     if not context.strip():
#         return "I couldn't find relevant information in my knowledge base."

#     # Run the chain with the query and retrieved disaster guidelines
#     response = chain.invoke({"query": query, "results": context})
    
#     # Extract and return only the chatbot's content
#     return response.content if hasattr(response, "content") else response

# # Test the chatbot with a sample query
# if __name__ == "__main__":
#     test_query = "What should I do during a Tsunami?"
#     chatbot_response = generate_response(test_query)

#     print("\n🔹 Chatbot Response:\n")
#     print(chatbot_response)







































# # query = "What are the safety measures for earthquake?"
# # results = vector_store.similarity_search(query, k=5)  

# # # Print results
# # for i, doc in enumerate(results):
# #     print(f"\nResult {i+1}:\n{doc.page_content}\n")
    
    
# # # query = "What are the safety measures for earthquakes?"
# # # query_embedding = embedding_model.embed_query(query)

# # # print(f"Query Embedding Sample: {query_embedding[:5]}...")  # Print first 5 values

# # # index.delete(delete_all=True)

# # # print("Deleted")