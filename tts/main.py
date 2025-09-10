from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import pyttsx3
import PyPDF2
import os
import asyncio
import threading
from pathlib import Path
from typing import List, Dict, Optional
import json

app = FastAPI(title="Warhammer TTS Reader", description="Text-to-Speech reader for Warhammer novels")

templates = Jinja2Templates(directory="templates")

# Global TTS engine
tts_engine = None
current_session = {
    "book_path": None,
    "current_page": 0,
    "total_pages": 0,
    "is_playing": False,
    "auto_continue": True
}

def init_tts():
    """Initialize TTS engine"""
    global tts_engine
    try:
        tts_engine = pyttsx3.init()
        # Set properties
        tts_engine.setProperty('rate', 150)  # Speed of speech
        tts_engine.setProperty('volume', 0.9)  # Volume level (0.0 to 1.0)
        
        # Try to set voice (optional)
        voices = tts_engine.getProperty('voices')
        if voices:
            # Use first available voice
            tts_engine.setProperty('voice', voices[0].id)
            
    except Exception as e:
        print(f"TTS initialization error: {e}")
        tts_engine = None

def scan_books() -> Dict[str, List[Dict]]:
    """Scan for PDF books in adjacent directories"""
    base_path = Path(__file__).parent.parent
    books = {}
    
    for item in base_path.iterdir():
        if item.is_dir() and item.name != "tts" and not item.name.startswith('.'):
            folder_books = []
            
            # Scan recursively for PDF files
            for pdf_file in item.rglob("*.pdf"):
                relative_path = pdf_file.relative_to(base_path)
                folder_books.append({
                    "name": pdf_file.stem,
                    "path": str(pdf_file),
                    "relative_path": str(relative_path),
                    "size": pdf_file.stat().st_size
                })
            
            if folder_books:
                books[item.name] = sorted(folder_books, key=lambda x: x["name"])
    
    return books

def extract_page_text(pdf_path: str, page_num: int) -> str:
    """Extract text from a specific PDF page"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            if page_num >= len(pdf_reader.pages):
                return ""
            
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            
            # Clean up text
            text = text.replace('\n', ' ').replace('\r', ' ')
            text = ' '.join(text.split())  # Remove extra whitespace
            
            return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading PDF: {str(e)}")

def get_total_pages(pdf_path: str) -> int:
    """Get total number of pages in PDF"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            return len(pdf_reader.pages)
    except Exception as e:
        return 0

@app.on_event("startup")
async def startup_event():
    """Initialize TTS on startup"""
    init_tts()

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Home page with book selection"""
    books = scan_books()
    return templates.TemplateResponse("index.html", {
        "request": request, 
        "books": books,
        "current_session": current_session
    })

@app.get("/api/books")
async def get_books():
    """API endpoint to get available books"""
    return scan_books()

@app.post("/api/select-book")
async def select_book(book_data: dict):
    """Select a book and initialize reading session"""
    global current_session
    
    book_path = book_data.get("path")
    if not book_path or not os.path.exists(book_path):
        raise HTTPException(status_code=404, detail="Book not found")
    
    total_pages = get_total_pages(book_path)
    
    current_session.update({
        "book_path": book_path,
        "current_page": 0,
        "total_pages": total_pages,
        "is_playing": False,
        "book_name": book_data.get("name", "Unknown")
    })
    
    return {
        "success": True,
        "book_name": current_session["book_name"],
        "total_pages": total_pages,
        "current_page": 0
    }

@app.post("/api/read-page")
async def read_page(page_data: dict):
    """Read a specific page"""
    global current_session, tts_engine
    
    if not current_session["book_path"]:
        raise HTTPException(status_code=400, detail="No book selected")
    
    if not tts_engine:
        raise HTTPException(status_code=500, detail="TTS engine not initialized")
    
    page_num = page_data.get("page", current_session["current_page"])
    
    if page_num >= current_session["total_pages"]:
        return {"success": False, "message": "End of book reached"}
    
    try:
        text = extract_page_text(current_session["book_path"], page_num)
        
        if not text.strip():
            return {"success": False, "message": "No text found on this page"}
        
        current_session["current_page"] = page_num
        current_session["is_playing"] = True
        
        # Start TTS in a separate thread
        def speak_text():
            try:
                tts_engine.say(text)
                tts_engine.runAndWait()
                current_session["is_playing"] = False
                
                # Auto-continue to next page if enabled
                if current_session["auto_continue"] and page_num + 1 < current_session["total_pages"]:
                    current_session["current_page"] += 1
                    
            except Exception as e:
                print(f"TTS Error: {e}")
                current_session["is_playing"] = False
        
        threading.Thread(target=speak_text, daemon=True).start()
        
        return {
            "success": True,
            "page": page_num,
            "text_preview": text[:200] + "..." if len(text) > 200 else text,
            "is_playing": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading page: {str(e)}")

@app.post("/api/stop")
async def stop_reading():
    """Stop current TTS"""
    global tts_engine, current_session
    
    if tts_engine:
        try:
            tts_engine.stop()
        except:
            pass
    
    current_session["is_playing"] = False
    return {"success": True}

@app.post("/api/next-page")
async def next_page():
    """Go to next page"""
    global current_session
    
    if current_session["current_page"] + 1 < current_session["total_pages"]:
        return await read_page({"page": current_session["current_page"] + 1})
    else:
        return {"success": False, "message": "End of book reached"}

@app.post("/api/previous-page")
async def previous_page():
    """Go to previous page"""
    global current_session
    
    if current_session["current_page"] > 0:
        return await read_page({"page": current_session["current_page"] - 1})
    else:
        return {"success": False, "message": "Already at first page"}

@app.get("/api/status")
async def get_status():
    """Get current reading status"""
    return current_session

@app.post("/api/toggle-auto-continue")
async def toggle_auto_continue():
    """Toggle auto-continue feature"""
    global current_session
    current_session["auto_continue"] = not current_session["auto_continue"]
    return {"auto_continue": current_session["auto_continue"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)