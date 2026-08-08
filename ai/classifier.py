import os
import json
from dotenv import load_dotenv
from google import genai
from PIL import Image

# Load API key
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

# Connect to Gemini
client = genai.Client(api_key=api_key)

# disposal rules
disposal_rules = {
    "Wet/Organic": "Place in green organic waste bin for composting.",
    "Paper": "Flatten and place in the blue recycling bin.",
    "Plastic": "Rinse out and place in the plastic recycling bin.",
    "Glass": "Handle with care, rinse, and place in the glass recycling container.",
    "Metal": "Place in the scrap metal/recycling bin.",
    "E-waste": "Drop off at a designated electronic waste collection point.",
    "Hazardous": "Take to a toxic and hazardous household waste facility.",
    "Textile": "Donate if usable, or take to a textile recycling drop-box.",
    "Other": "Dispose of in the general landfills/residual waste bin."
}

def classify_waste(image_path):

    image = Image.open(image_path)
    prompt = """
    You are a waste classification assistant.

    Classify the waste in the image into exactly ONE of these categories:

    Wet/Organic
    Paper
    Plastic
    Glass
    Metal
    E-waste
    Hazardous
    Textile
    Other

    Also provide a confidence level:
    - high
    - medium
    - low

    Use "low" if the image is unclear, contains multiple materials, or you are unsure.

    Return ONLY valid JSON in exactly this format:

    {
        "category": "...",
        "object": "...",
        "explanation": "..."
        "confidence": "..."
    }

    Do not add markdown or any text outside the JSON.
    """

    # Ask Gemini to identify it
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[prompt, image]
    )

    # Category using json
    result = json.loads(response.text)

    category = result["category"]



    result["disposal"] = disposal_rules.get(
        category,
        "Check local waste disposal guidelines"
    )

    return result