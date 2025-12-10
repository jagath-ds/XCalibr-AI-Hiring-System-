# utils.py
import os
import shutil
from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader

def read_cv(file_path: str) -> str:
    """
    Reads the content of a CV file (PDF or DOCX) and returns the raw text.

    Uses the appropriate LangChain document loader to extract all text content,
    preparing it for analysis by the AI model.

    Args:
        file_path: The full local path to the CV file that was uploaded.

    Returns:
        A single string containing all the extracted text from the document.

    Raises:
        FileNotFoundError: If the file does not exist at the specified path.
        ValueError: If the file extension is not .pdf or .docx.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found at: {file_path}")
    file_extension = os.path.splitext(file_path)[1].lower()

    if file_extension == ".pdf":
        loader = PyPDFLoader(file_path)
    elif file_extension == ".docx":
        loader = Docx2txtLoader(file_path)
    else:
        raise ValueError("Unsupported file type. Only PDF and DOCX are supported.")

    documents = loader.load_and_split()
    content = "".join([page.page_content for page in documents])
    
    return content

def save_upload_file(upload_file: UploadFile, destination: str) -> str:
    """
    Saves an uploaded file to the specified destination path.
    
    Args:
        upload_file: The FastAPI UploadFile object
        destination: Full path where to save the file
        
    Returns:
        The destination path
    """
    
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(destination), exist_ok=True)
        
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            
    finally:
        # Always close the file handle after use to prevent resource leaks
        upload_file.file.close() 
    
    return destination