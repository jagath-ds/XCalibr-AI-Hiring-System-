# ollama_client.py
import json
import logging
from langchain_community.chat_models import ChatOllama
from langchain.schema import SystemMessage, HumanMessage, AIMessage, BaseMessage
from typing import List, Dict, Any

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def invoke_ollama_json(
    model_name: str,
    system_prompt: str,
    user_content: str,
    temperature: float = 0.3
) -> Dict[str, Any]:
    """
    Invokes a specified Ollama model expecting a JSON response.

    Args:
        model_name: The name of the Ollama model to use (e.g., "llama3", "mistral").
        system_prompt: The system prompt guiding the model, MUST explicitly request JSON.
        user_content: The user's input/content for the model to process.
        temperature: The temperature setting for the LLM.

    Returns:
        A dictionary parsed from the Ollama model's JSON response.

    Raises:
        RuntimeError: If the Ollama API call fails or initialization fails.
        ValueError: If the Ollama response cannot be parsed as valid JSON or misses expected structure implicitly defined by the prompt.
    """
    logger.info(f"Initializing Ollama client with model: {model_name}")
    try:
        # Initialize the ChatOllama client.
        # `format="json"` can be added if your Ollama version/model reliably supports it.
        # If it causes errors, remove it and rely solely on the prompt structure.
        # llm = ChatOllama(model=model_name, format="json", temperature=temperature)
        llm = ChatOllama(model=model_name, temperature=temperature)

    except Exception as e:
        logger.error(f"Failed to initialize ChatOllama with model {model_name}: {e}", exc_info=True)
        raise RuntimeError(f"Could not connect to or initialize Ollama model {model_name}: {e}") from e

    # Construct messages for the LLM
    messages: List[BaseMessage] = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_content),
    ]

    logger.info(f"Sending request to Ollama model {model_name}...")
    
    json_output_str = ""
    try:
        completion: BaseMessage = llm.invoke(messages) 
        
        json_output_str = str(completion.content) 
        logger.debug(f"Raw Ollama response: {json_output_str}") # Debug level for potentially verbose output

        # Basic cleanup attempt for markdown code fences
        cleaned_str = json_output_str.strip()
        if cleaned_str.startswith("```json"):
            cleaned_str = cleaned_str[7:]
        if cleaned_str.endswith("```"):
            cleaned_str = cleaned_str[:-3]
        cleaned_str = cleaned_str.strip() # Remove leading/trailing whitespace

        if not cleaned_str:
            logger.error("Ollama returned an empty response.")
            raise ValueError("Ollama returned an empty response.")

        logger.info("Attempting to parse JSON response from Ollama.")
        parsed_json = json.loads(cleaned_str)
        logger.info("Successfully parsed JSON response.")
        return parsed_json

    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON from Ollama. Response snippet: {json_output_str[:500]}", exc_info=True)
        raise ValueError(f"Ollama returned invalid JSON: {e}. Response snippet: {json_output_str[:200]}") from e
    except Exception as e:
        # Catch other potential errors during invoke or processing
        logger.error(f"An error occurred calling Ollama model {model_name} or processing its response: {e}", exc_info=True)
        raise RuntimeError(f"Ollama API call or processing failed: {e}") from e

