# Passing the Sticks - Project To-Do Guide (Updated)

This file is your **implementation roadmap** for building the
`/passingthesticks` section of your Rush2026 site.

---

## 🎯 Project Goal

Create a cinematic, interactive tribute page - *Passing the Sticks* -
celebrating the transition from Neil Peart to Anika Nilles using still images,
subtle animation, and AI-generated narration.

---

## ✅ Phase 1 – Asset Gathering

### 1. Image assets

Create or locate the following and store them under
`/public/images/passingthesticks/`:

- [x] `neil.png` - still of Neil Peart by his kit.
- [x] `anika.png` - still of Anika Nilles by her kit.
- [x] `kit_transition_overlay.png` - pictures blend from Neil to Anika.
- [x] `red_star_bg.png` - translucent Rush star logo background

### 2. Audio assets

- [x] `narrator_voice.mp3` - AI-generated voice-over file (Google Cloud TTS recommended)

### 3. Fonts

Will use Google Fonts - "Orbitron" for headings and "Open Sans" for body text via web links and CSS.

#### How to add fonts (web links)

Add this to your main HTML `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Open+Sans:wght@400;700&display=swap" rel="stylesheet">
```

#### CSS for fonts

Add this to your CSS (or Tailwind config):

```css
body {
  font-family: 'Open Sans', Arial, sans-serif;
}
h1, h2, h3, .font-orbitron {
  font-family: 'Orbitron', Arial, sans-serif;
}
```

Or use Tailwind utilities:

```html
<h1 class="font-orbitron">Heading</h1>
<p class="font-open-sans">Body text</p>
```

---

## 🧠 Phase 2 – Generate Narration MP3

### Narration text

> "The rhythm never truly ends. It changes hands, evolves, and finds new
> expression."

### Option A - Google Cloud Text-to-Speech (Recommended)

1. [x] Enable **Text-to-Speech API** in Google Cloud Console.
2. [x] Create a **new service account** (`tts-narration-generator`).
3. [x] Assign role - "Text-to-Speech Admin".
4. [x] Download the JSON key - save in `/keys/tts-narration-generator.json`.
5. [x] Set environment variable:

   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/tts-narration-generator.json"
   ```

6. [x] Install and run the script:

   ```bash
   pip install google-cloud-texttospeech
   ```

   ```bash
   # Python code (see docs for details)
   python << 'EOF'
   from google.cloud import texttospeech

   client = texttospeech.TextToSpeechClient()
   input_text = texttospeech.SynthesisInput(
     text="The rhythm never truly ends. It changes hands, evolves, and finds new expression."
   )
   voice = texttospeech.VoiceSelectionParams(
     language_code="en-US", name="en-US-Neural2-D"
   )
   audio_config = texttospeech.AudioConfig(
     audio_encoding=texttospeech.AudioEncoding.MP3
   )

   response = client.synthesize_speech(
     input=input_text, voice=voice, audio_config=audio_config
   )

   with open("narrator_voice.mp3", "wb") as out:
     out.write(response.audio_content)
   EOF
   ```

- [x] `narrator_voice.mp3` - AI-generated voice-over file (Google Cloud TTS recommended)

### Option B - OpenAI TTS (Alternative)

```text
# Python code (see docs for details)
   - [x] Enable **Text-to-Speech API** in Google Cloud Console.
   - [x] Create a **new service account** (`tts-narration-generator`).
   - [x] Assign role - "Text-to-Speech Admin".
   - [x] Download the JSON key - save in `/keys/tts-narration-generator.json`.
   - [x] Set environment variable:
       - [x] `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/tts-narration-generator.json"`
   - [x] Install and run the script:
       - [x] `pip install google-cloud-texttospeech`
       - [x] Run Python code to generate narration MP3:
         ```python
         from google.cloud import texttospeech

         client = texttospeech.TextToSpeechClient()
         input_text = texttospeech.SynthesisInput(
             text="The rhythm never truly ends. It changes hands, evolves, and finds new expression."
         )
         voice = texttospeech.VoiceSelectionParams(
             language_code="en-US", name="en-US-Neural2-D"
         )
         audio_config = texttospeech.AudioConfig(
             audio_encoding=texttospeech.AudioEncoding.MP3
         )

         response = client.synthesize_speech(
             input=input_text, voice=voice, audio_config=audio_config
         )

         with open("narrator_voice.mp3", "wb") as out:
             out.write(response.audio_content)
         ```
       `narrator_voice.mp3` - AI-generated voice-over
          speech = client.audio.speech.create(
              model="gpt-4o-mini-tts",
              voice="alloy",
              input="The rhythm never truly ends. It changes hands, evolves, and finds new expression."
          )
          with open("narrator_voice.mp3", "wb") as f:
              f.write(speech.read())
```

---

## 🧩 Phase 3 – Page Implementation

### Folder structure

```text
/src/pages/passingthesticks/
  index.html
  passingthesticks.css
/public/images/passingthesticks/
  neil.png
  anika.png
  kit_transition_overlay.png
/public/audio/passingthesticks/
  narrator_voice.mp3
```

### Key scenes for the index.html/passingthesticks.css

- [ ] Scene 1 - Neil with his kit (fade-in animation) - use neil.png
- [ ] Scene 2 - Kit transition overlay (crossfade animation) - use kit_transition_overlay.png
- [ ] Scene 3 - Anika with her kit (fade-in animation) - use anika.png
- [ ] Scene 4 - Split fade into Rush red star (final logo) - use red_star_bg.png

- [ ] Add `index.html` and `passingthesticks.css` using this structure like this (I say like as you will need to fill in the details):

```html
<section id="passing-the-sticks" class="relative min-h-screen bg-black text-gray-200 overflow-hidden">
  <div class="absolute inset-0 bg-[url('/assets/passingthesticks/red_star_bg.svg')] bg-center bg-cover opacity-10"></div>
  <div class="scene fade-in flex flex-col items-center justify-center h-screen text-center px-4">
    <img src="/assets/passingthesticks/neil_bw.jpg" alt="Neil Peart behind the drums" class="w-full max-w-4xl mx-auto opacity-80" />
    <blockquote class="mt-8 text-xl italic text-gray-300 max-w-2xl">
      "What is a master but a master student? And if that's true, then there's a responsibility on you to keep getting better and to explore avenues of your profession."
      <footer class="mt-4 text-red-500 font-semibold">- Neil Peart</footer>
    </blockquote>
  </div>
</section>
```

### CSS animation

```text
.fade-in { animation: fadeIn 3s ease-in forwards; }
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

---

## 🔄 Phase 4 – Integration & QA

- [ ] Add route `/passingthesticks` in `vite.config.ts`
- [ ] Verify all images resolve correctly under `/public/image/passingthesticks/`
- [ ] Verify all audio files resolve correctly under `/public/audio/passingthesticks/`
- [ ] Deploy through Cloudflare Pages
- [ ] Test on mobile (responsive text scaling)
- [ ] Validate performance via Lighthouse (target >= 90)
- [ ] Confirm meta tags:

```html
<meta property="og:image" content="https://rush2026.fyi/assets/passingthesticks/red_star_bg.svg" />
<meta property="og:title" content="Passing the Sticks - A Tribute to Neil Peart and Anika Nilles" />
<meta property="og:description" content="Two drummers. One pulse. The rhythm continues." />
```

---

### Goal

- [ ] Once all items are checked off, `/passingthesticks` will be a self-contained,
cinematic Rush timeline tribute with minimal load time and high emotional
impact.
