import os
import googlemaps
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# Load API keys from .env file
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
news_api_key = os.getenv("NEWS_API_KEY")

# Initialize FastAPI app
app = FastAPI()

# Initialize Google Maps API Client
gmaps = googlemaps.Client(key=google_maps_api_key)

# Disaster-related keywords (combined as a single query)
disaster_keywords = [
    "earthquake", "flood", "explosion", "hurricane", "landslide",
    "wildfire", "cyclone", "tsunami", "pandemic", "crisis", "disaster", "calamity"
]
combined_keywords = " OR ".join(disaster_keywords)  # Example: "earthquake OR flood OR hurricane"


# 1️⃣ **Function to Extract State & Country from Coordinates**
def get_location_details(lat, lng):
    try:
        reverse_geocode_result = gmaps.reverse_geocode((lat, lng))
        if not reverse_geocode_result:
            return None, None  # No results found
        
        country, state = None, None
        for result in reverse_geocode_result:
            for component in result["address_components"]:      
                if "country" in component["types"]:
                    country = component["long_name"]
                if "administrative_area_level_1" in component["types"]:
                    state = component["long_name"]
        
        return state, country  # Return extracted values

    except Exception as e:
        print(f"⚠️ Error fetching location: {e}")
        return None, None


# 2️⃣ **Optimized Function to Fetch Disaster News**
def get_disaster_news(location):
    """Fetch disaster-related news using a single API call with combined keywords."""
    url = f"https://newsapi.org/v2/everything?q={location} AND ({combined_keywords})&language=en&apiKey={news_api_key}"
    
    try:
        response = requests.get(url)
        data = response.json()

        if data.get("status") != "ok" or "articles" not in data:
            return []

        # Extract relevant news articles
        filtered_news = []
        for article in data["articles"]:
            title = article.get("title", "")
            description = article.get("description", "")
            source_name = article.get("source", {}).get("name", "")

            if title and description and location.lower() in (title + description + source_name).lower():
                filtered_news.append(f"{title} - {description}")
                
       
        return filtered_news[:5]  # Return top 5 articles

    except Exception as e:
        print(f"⚠️ Error fetching news: {e}")
        return []


# 3️⃣ **Function to Summarize News**
def summarize_news(news_articles, location_level):
    if not news_articles:
        return f"No disaster updates available for {location_level}."

    llm = ChatOpenAI(model_name="gpt-4o", temperature=0.5, openai_api_key=openai_api_key)

    template = f"""
        Summarize the following news into a concise paragraph-based report. Only include the news if it is **clearly related to a disaster** and provides a relevant and meaningful update for users in {location_level}. 

        Ensure that:
        1. **The news is disaster-related.** Ignore any unrelated news.
        2. **The summary focuses on {location_level}.** Exclude details that are not relevant to this location.
        3. **Each news item is presented as a separate paragraph.** Separate each news summary with a blank line.
        4. **If multiple news updates describe a sequence of events, present them in chronological order to maintain clarity.**

        News to analyze:
        {{news}}

        Format the output as follows:
        - Each news update should be a short paragraph.
        - Separate different news items with a blank line.
        """


    prompt = PromptTemplate(input_variables=["news"], template=template)
    chain = prompt | llm  # Chain prompt with LLM model

    try:
        summary = chain.invoke({"news": "\n".join(news_articles)})
        
        return summary.content.strip() if hasattr(summary, "content") else "No summary available."

    except Exception as e:
        print(f"⚠️ Error summarizing news: {e}")
        return "No summary available."


# 4️⃣ **API Endpoint to Fetch & Summarize Disaster News**
@app.get("/get-disaster-news")
def disaster_alert(lat: float = Query(..., description="Latitude"), lng: float = Query(..., description="Longitude")):
    print("In disaster")
    state, country = get_location_details(lat, lng)

    if not state and not country:
        return {"status": "error", "message": "Could not determine your location."}

    print(f"📍 Location Details: State - {state}, Country - {country}")

    # Fetch and summarize news for each level
    response_data = {"status": "success", "state": state, "country": country, "news": {}}

    if state:
        state_news = get_disaster_news(state)
        response_data["news"]["state"] = summarize_news(state_news, state)

    if country:
        country_news = get_disaster_news(country)
        response_data["news"]["country"] = summarize_news(country_news, country)

    return response_data


# 5️⃣ **Run the API Locally**
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
