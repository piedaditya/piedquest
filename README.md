# Daily Trivia Quest

I am building a daily trivia web application for a passionate fandom. I have attached a screenshot of my landing page design. Please build a functional React web app that matches this dark mode, neon-accented aesthetic exactly.



Here is the core functionality required:

1. Daily Lock Logic: The app should serve exactly one 5-question quiz per day. Once the user completes it, they are locked out until midnight (local time) the next day. Show a countdown timer to the next quiz.

2. The Quiz Interface: Clean, bold typography with 4 multiple-choice answers per question. Include smooth transition animations between questions. 

3. Scoring & Streaks: Track the user's score out of 5 and their current daily login streak using local storage (for now, we will add user accounts later).

4. The Viral Share Button: The most important feature. On the results screen, provide a massive "Share Score" button. When clicked, it copies a text string to their clipboard using emoji grids (just like Wordle). Example: 

"DailyQuest #42 

🟩🟩🟥🟩🟩 

🔥 12 Day Streak! 

Play at [YourLink]"

5. Database Setup: Please scaffold a simple Supabase connection so I can easily add new daily questions to a database table instead of hardcoding them.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f331c8de-22bf-4f2a-a870-bc37d62f7a4f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
