# 🚀 Future Feature Ideas

## 🎵 Lyric Challenge Mode (Priority)

**Concept**: A dedicated game mode focused on Neil Peart's lyrics.

**Mechanics**:
1.  **AI Prompt**: The AI presents a snippet of lyrics (e.g., 2-3 lines).
2.  **User Task**:
    *   **Complete the Lyric**: Fill in the missing next line or phrase.
    *   **Identify the Song**: Name the song title the lyrics belong to.
3.  **Scoring**:
    *   **Full Points**: Correctly completing the lyric AND naming the song.
    *   **Partial Points**: Getting only one of the two correct.
4.  **Implementation**:
    *   Use Gemini to generate the lyric snippets and validate the user's text input (fuzzy matching for lyrics).

---

## 📅 "Time Stand Still" (Album Chronology)

**Concept**: A drag-and-drop mini-game for discography knowledge.

**Mechanics**:
*   Users are presented with 3-5 random Rush album covers.
*   Task: Arrange them in chronological order of release.
*   Difficulty levels:
    *   *Easy*: Albums from different decades.
    *   *Hard*: Albums released within a few years of each other.

## 📚 "The Professor's Reading List"

**Concept**: Educational tribute section connecting literature to music.

**Mechanics**:
*   Display books that influenced Neil Peart (e.g., *Atlas Shrugged*, *The Fountainhead*, *Candide*).
*   AI-generated summaries explaining the connection between the book and specific Rush songs (e.g., *Anthem*, *2112*).

## 🏆 Global Leaderboard

**Concept**: Persistent high scores to drive competition.

**Mechanics**:
*   Backend: Use Cloudflare KV or D1 to store scores.
*   Display: Top 10 daily/all-time scores.
*   *Stretch*: Filter by "Fan Story" type (e.g., "Old School Fans" vs "New World Men").

## 🎹 Era Selector

**Concept**: Custom game filters.

**Mechanics**:
*   Allow users to select specific eras for their trivia questions:
    *   *The Prog Years* (70s)
    *   *The Synth Era* (80s)
    *   *Return to Form* (90s-2000s)
