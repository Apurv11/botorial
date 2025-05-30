---
description: 
globs: 
alwaysApply: false
---

# Rummy Game Assistant Project Plan

**Goal:** To build a functional Rummy Game Assistant within the hackathon timeframe, demonstrating Agentic AI capabilities using Amazon Claude.

## 1. Project Setup and Initialization

### Frontend (React.js)
- Create a new React project using Create React App or Vite.
- Install necessary dependencies: `react-router-dom`, `axios`, `socket.io-client`, `react-icons`, `tailwindcss` (or similar for styling).
- Set up basic routing for Home, Ask Bot, and Play Game pages.

### Backend (Node.js/Express.js)
- Initialize a new Node.js project.
- Install core dependencies: `express`, `mongoose`, `dotenv`, `cors`, `socket.io`.
- Set up a basic Express server.
- Connect to MongoDB.

## 2. Core Functionalities Development

### 2.1. Ask BOT Feature

**Frontend (React.js):**
- Create `AskBotPage.jsx`.
- Implement a chat interface: input text box, send button, message display area.
- Display user queries and bot responses in a chat bubble format.
- Integrate with the backend API to send user messages and receive Claude's responses.

**Backend (Node.js/Express.js):**
- Create `/api/chat` endpoint.
- This endpoint will receive user text input.
- **Claude Integration:**
    - Use AWS SDK for JavaScript (v3) to interact with Amazon Bedrock.
    - Configure AWS credentials (access key, secret key, region).
    - Call the `InvokeModelCommand` for Anthropic Claude.
    - Pass user query as `prompt` to Claude.
    - Define a system prompt for Claude to act as a Rummy expert, providing rules, strategies, and general Rummy knowledge.
    - Parse Claude's response and send it back to the frontend.
- Implement basic chat session management (optional for hackathon, but good for context).

### 2.2. Play with BOT Feature (Rummy Game)

**Frontend (React.js):**
- Create `PlayGamePage.jsx`.
- **Game Table UI:**
    - Represent the playing area, player's hand, discard pile, draw pile.
    - Visual representation of cards (e.g., `Card.jsx` component for each card).
- **Player Hand Management:**
    - Display player's 13 cards.
    - **Card Sorting:** Implement client-side logic to sort cards by suit, rank, or group (e.g., numerical order within suits, then by suit). Provide interactive buttons for sorting.
    - **Drag and Drop / Click for Interaction:** Allow users to pick/discard cards, and form melds.
- **Game Actions:**
    - Draw a card (from draw pile or discard pile).
    - Discard a card.
    - Declare melds (sets and sequences).
    - Declare game.
- **Suggestions:**
    - Implement a button "Get Suggestion".
    - When clicked, send current hand state to backend.
    - Display suggestions from the AI (e.g., "Meld 3 of Hearts, 4 of Hearts, 5 of Hearts", "Discard Queen of Spades").
- **Hand Card Score:**
    - Display the current score of the player's hand (points of ungrouped cards). Update dynamically.

**Backend (Node.js/Express.js with Socket.IO):**
- **Real-time Game State:**
    - Use `socket.io` for real-time communication between players (user and bot) and the server.
    - Emit game state updates (card drawn, card discarded, meld formed, turn change) to both clients.
- **Rummy Game Logic (`rummyGameLogic.js`):**
    - **Deck Management:**
        - **Closed Deck (Stock Pile):**
            - Initialize with one or more standard 52-card decks, plus jokers as per defined rules.
            - Implement shuffling mechanism (e.g., Fisher-Yates algorithm).
            - Function to draw the top card.
            - Logic to handle exhaustion: if the stock pile runs out, the discard pile (except the last card) is shuffled to become the new stock pile.
        - **Open Deck (Discard Pile):**
            - Initialize with one card from the stock pile after dealing.
            - Function to add a card to the top (when a player discards). The discarded card is always face up.
            - Function to allow a player to pick the top card from the discard pile (as an alternative to drawing from the stock pile).
    - Dealing: Distribute 13 cards to each player (user and bot).
- **Turn Management:**
    - Player turn, bot turn.
- **Validation of melds:**
    - Sets and sequences.
- **Scoring logic:**
    - Calculating points for a hand.
- **Game end conditions:**
    - Declaration, valid declaration check.
- **Bot AI (`gameController.js` leveraging Claude/custom logic):**
    - **Initial AI Strategy (Rule-based first, then integrate Claude):**
        - For basic play, the bot can follow simple rules:
            - Prioritize forming pure sequences.
            - Then sets.
            - Then impure sequences.
            - Discard high-value unmatched cards.
    - **Claude Integration for Advanced Bot Play (Stretch Goal/Enhancement):**
        - Send the bot's current hand and game state to Claude.
        - Ask Claude for the "best move" (e.g., "Given this Rummy hand and discard pile, what card should I draw/discard, or what melds can I form?").
        - Parse Claude's response and execute the suggested action. This would be challenging but powerful.
    - **Suggestion System:**
        - Expose an API endpoint (`/api/game/suggest`) that takes the current hand.
        - This endpoint calls `rummyGameLogic.js` to analyze the hand and suggest melds or optimal discards.
        - For more advanced suggestions, this could also leverage Claude by describing the hand and asking for optimal moves.

### 2.3. Post-Game Analysis

**Frontend (React.js):**
- After a game ends, display a "Game Analysis" screen.
- Show a summary of the game.

**Backend (Node.js/Express.js leveraging Claude):**
- Capture game history (moves made by user and bot).
- After the game, send the game history to Claude.
- **Claude Analysis Prompt:**
    - "Analyze this Rummy game log. Player A's moves are X, Y, Z. Bot's moves are A, B, C. Provide feedback on Player A's strategy, highlight good moves, suggest improvements, and identify missed opportunities for melds or declarations."
- Receive and process Claude's analytical response.
- Send the analysis back to the frontend for display.
- Store game history and analysis in MongoDB for future review (optional).

## 3. Database (MongoDB)

- **User Authentication:** Store user credentials (hashed passwords) in `User` collection.
- **Chat Sessions:** Store chat history for "Ask BOT" if persistent context is desired (optional).
- **Game State:** Store ongoing game states in `Game` collection for persistence or if multiple concurrent games are envisioned (useful for resuming games or detailed analysis).
- **Game History/Analysis:** Store past game results and AI analysis for "Post-Game Analysis" feature.

## 4. Authentication (Optional, but Recommended for Hackathon)

- Implement simple user registration and login using JWTs.
- Protect backend routes.

## 5. Deployment Considerations (for Hackathon)

- Host React app on S3/CloudFront or Netlify/Vercel.
- Host Node.js backend on EC2, Elastic Beanstalk, or Lambda.
- MongoDB Atlas for managed database.
- Ensure AWS Bedrock access is configured and working.

## 6. Testing

- Manual testing of all features.
- Consider basic unit tests for Rummy game logic.

## 7. Next Steps (After Cursor Generation)

- Review generated code: Understand the structure and fill in logic where placeholders exist.
- Implement detailed Rummy game logic: This is complex and might require significant custom coding.
- Refine Claude prompts: Experiment with different prompts to get the desired quality of responses for both the "Ask BOT" and "Play with BOT" suggestions/analysis.
- Implement responsive UI for various screen sizes.

---

**How to use this with Cursor:**

1.  **Create the file:** Save the entire content above into a file named `rummy_assistant.mdc` (or any `.mdc` extension) in your desired project directory.
2.  **Open with Cursor:** Open Cursor IDE, then open the `rummy_assistant.mdc` file.
3.  **Initiate Generation:** Cursor should recognize the `.mdc` format and prompt you to generate the project based on the description. Follow its instructions.

**Important Considerations for Cursor:**

* **Iteration:** Cursor might not generate everything perfectly on the first try. Be prepared to iterate, refining the `.mdc` file or providing further instructions in Cursor's chat interface after the initial generation.
* **Specifics:** The more specific you are in the `.mdc` file (e.g., exact field names for MongoDB schemas, specific API routes), the better the output will be. I've provided a good level of detail, but for a hackathon, you might need to fill in some finer points.
* **API Keys/Credentials:** Remember to handle AWS credentials securely (e.g., using environment variables, AWS IAM roles for production, not hardcoding).
* **Rummy Logic Complexity:** The core Rummy game logic (shuffling, dealing, meld validation, scoring, bot AI) is the most complex part. Claude can *assist* with strategic suggestions, but the foundational game rules need to be robustly coded in your Node.js backend.

Good luck with your hackathon! This is a fantastic idea, and the agentic AI aspect with Claude will be a powerful differentiator.