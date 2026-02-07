
# Gemini Multimodal Creative Studio 🎨🎙️🎬

A high-end creative suite built with React and the Google Gemini API. This application features real-time voice conversation, high-fidelity image generation, cinematic video generation, and web-grounded search.

## Features

-   **Smart Search**: Real-time web-grounded search using Gemini 3 Flash.
-   **Image Canvas**: Text-to-image generation with Gemini 2.5 Flash Image.
-   **Voice Lab**: Low-latency, real-time voice interaction using Gemini 2.5 Flash Native Audio.
-   **Video Studio**: Cinematic video generation powered by Veo 3.1.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
    cd YOUR_REPO
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_ai_studio_api_key
    ```

4.  **Run the application:**
    ```bash
    npm start
    ```

## Security Note

This app uses `process.env.API_KEY`. Ensure you never commit your `.env` file to version control. The included `.gitignore` handles this automatically.
