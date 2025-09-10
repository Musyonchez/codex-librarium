# Warhammer TTS Reader

A FastAPI-based Text-to-Speech application for reading Warhammer novels and other PDF books.

## Features

- 🔍 **Auto-discovery**: Automatically scans adjacent folders for PDF books
- 📖 **Page-by-page reading**: Select specific pages to read aloud
- ⚡ **Auto-continue**: Automatically continues to the next page after finishing current page
- 🎛️ **Web interface**: Clean, dark-themed web UI for easy control
- 🔊 **TTS control**: Start, stop, and navigate through pages
- 📱 **Responsive**: Works on desktop and mobile devices

## Setup

### Prerequisites

Install system dependencies:

```bash
# On Ubuntu/Debian
sudo apt update
sudo apt install espeak espeak-data libespeak-dev portaudio19-dev

# On Arch Linux
sudo pacman -S espeak portaudio

# On macOS
brew install espeak portaudio
```

### Installation

1. Create a virtual environment:
```bash
cd tts
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Running the Application

1. Start the FastAPI server:
```bash
python main.py
```

2. Open your web browser and go to:
```
http://localhost:8000
```

## Usage

1. **Select a Book**: Browse the available books from adjacent folders and click to select one
2. **Choose a Page**: Enter a page number or use the navigation buttons
3. **Start Reading**: Click "Read Page" to start TTS for the current page
4. **Navigate**: Use Previous/Next buttons or type specific page numbers
5. **Auto-continue**: Toggle the auto-continue feature to automatically read subsequent pages

## API Endpoints

- `GET /` - Web interface
- `GET /api/books` - Get list of available books
- `POST /api/select-book` - Select a book for reading
- `POST /api/read-page` - Read a specific page
- `POST /api/next-page` - Go to next page
- `POST /api/previous-page` - Go to previous page
- `POST /api/stop` - Stop current TTS
- `GET /api/status` - Get current reading status
- `POST /api/toggle-auto-continue` - Toggle auto-continue feature

## Configuration

The TTS engine settings can be modified in `main.py`:

```python
tts_engine.setProperty('rate', 150)    # Speech speed (words per minute)
tts_engine.setProperty('volume', 0.9)  # Volume level (0.0 to 1.0)
```

## Troubleshooting

### TTS Issues
- Ensure espeak is installed and working: `espeak "hello world"`
- Try different voice settings in the code
- Check audio output devices

### PDF Reading Issues
- Ensure PDF files are not password protected
- Some scanned PDFs might not have extractable text
- Check file permissions

### Performance
- Large PDF files may take longer to process
- Consider the speech rate setting for comfortable listening
- Auto-continue can be disabled for manual control

## File Structure

```
tts/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── templates/
│   └── index.html      # Web interface
└── README.md           # This file
```

## Dependencies

- **FastAPI**: Web framework
- **pyttsx3**: Text-to-speech engine
- **PyPDF2**: PDF text extraction
- **espeak**: System TTS engine
- **uvicorn**: ASGI server