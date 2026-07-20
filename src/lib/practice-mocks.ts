import type { Question } from "./quiz-queries";

type Mock = Omit<Question, "id" | "quizNumber" | "order"> & { key: string };

const raw: Record<string, Array<Omit<Mock, "category">>> = {
  Anime: [
    { key: "an1", question: "In Naruto, what is the name of the Nine-Tailed Fox sealed inside Naruto?", choices: ["Shukaku", "Kurama", "Matatabi", "Gyuki"], correctIndex: 1 },
    { key: "an2", question: "Who is the captain of the Straw Hat Pirates in One Piece?", choices: ["Zoro", "Sanji", "Luffy", "Usopp"], correctIndex: 2 },
    { key: "an3", question: "In Attack on Titan, what is the name of Eren's Titan form?", choices: ["Colossal Titan", "Armored Titan", "Attack Titan", "Beast Titan"], correctIndex: 2 },
    { key: "an4", question: "In Death Note, what is the name of Light Yagami's Shinigami?", choices: ["Rem", "Ryuk", "Sidoh", "Gelus"], correctIndex: 1 },
    { key: "an5", question: "What is the name of the academy in My Hero Academia?", choices: ["U.A. High", "Shiketsu", "Ketsubutsu", "Seiai"], correctIndex: 0 },
    { key: "an6", question: "In Demon Slayer, what breathing style does Tanjiro primarily use?", choices: ["Flame", "Thunder", "Water", "Wind"], correctIndex: 2 },
    { key: "an7", question: "Who wrote the manga Dragon Ball?", choices: ["Eiichiro Oda", "Akira Toriyama", "Masashi Kishimoto", "Tite Kubo"], correctIndex: 1 },
    { key: "an8", question: "In Fullmetal Alchemist, what is Edward Elric's automail limb?", choices: ["Left arm", "Right leg", "Right arm and left leg", "Both legs"], correctIndex: 2 },
    { key: "an9", question: "What is the highest-grossing anime film of all time (as of 2024)?", choices: ["Spirited Away", "Your Name", "Demon Slayer: Mugen Train", "Suzume"], correctIndex: 2 },
    { key: "an10", question: "In Jujutsu Kaisen, what is Gojo's cursed technique called?", choices: ["Limitless", "Ten Shadows", "Boogie Woogie", "Idle Transfiguration"], correctIndex: 0 },
    { key: "an11", question: "In Sailor Moon, what is Usagi's cat's name?", choices: ["Artemis", "Diana", "Luna", "Chibi"], correctIndex: 2 },
  ],
  Gaming: [
    { key: "gm1", question: "What is the name of the protagonist in The Legend of Zelda series?", choices: ["Zelda", "Link", "Ganon", "Sheik"], correctIndex: 1 },
    { key: "gm2", question: "Which company developed the game Elden Ring?", choices: ["CD Projekt Red", "FromSoftware", "Bethesda", "Square Enix"], correctIndex: 1 },
    { key: "gm3", question: "In Minecraft, what material is required to build a Nether Portal?", choices: ["Iron", "Diamond", "Obsidian", "Netherrack"], correctIndex: 2 },
    { key: "gm4", question: "Who is the main antagonist of Super Mario Bros?", choices: ["Wario", "Bowser", "King Boo", "Donkey Kong"], correctIndex: 1 },
    { key: "gm5", question: "What year was the original PlayStation released in North America?", choices: ["1994", "1995", "1996", "1997"], correctIndex: 1 },
    { key: "gm6", question: "In Fortnite, what is the name of the in-game currency?", choices: ["V-Bucks", "Robux", "Credits", "Gems"], correctIndex: 0 },
    { key: "gm7", question: "Which game features the character Master Chief?", choices: ["Destiny", "Halo", "Call of Duty", "Gears of War"], correctIndex: 1 },
    { key: "gm8", question: "What is the best-selling video game of all time?", choices: ["Tetris", "Minecraft", "GTA V", "Wii Sports"], correctIndex: 1 },
    { key: "gm9", question: "In The Witcher 3, what is Geralt's horse named?", choices: ["Shadowmere", "Roach", "Epona", "Agro"], correctIndex: 1 },
    { key: "gm10", question: "Which game popularized the battle royale genre?", choices: ["Fortnite", "PUBG", "Apex Legends", "H1Z1"], correctIndex: 1 },
    { key: "gm11", question: "Who is the protagonist of the God of War series?", choices: ["Atreus", "Kratos", "Zeus", "Baldur"], correctIndex: 1 },
  ],
  "Pop Culture": [
    { key: "pc1", question: "Which social media app is known for short-form vertical videos and launched globally in 2018?", choices: ["Vine", "TikTok", "Snapchat", "Triller"], correctIndex: 1 },
    { key: "pc2", question: "Who is known as the 'Queen of Pop'?", choices: ["Beyoncé", "Madonna", "Lady Gaga", "Britney Spears"], correctIndex: 1 },
    { key: "pc3", question: "What color dress caused a viral internet debate in 2015?", choices: ["Blue and black / white and gold", "Red and green", "Purple and pink", "Yellow and white"], correctIndex: 0 },
    { key: "pc4", question: "Which billionaire acquired Twitter in 2022?", choices: ["Jeff Bezos", "Elon Musk", "Mark Zuckerberg", "Bill Gates"], correctIndex: 1 },
    { key: "pc5", question: "What meme features a Shiba Inu with colorful text?", choices: ["Grumpy Cat", "Doge", "Nyan Cat", "Pepe"], correctIndex: 1 },
    { key: "pc6", question: "Which reality TV family is famous for the show 'Keeping Up With...'?", choices: ["The Hiltons", "The Osbournes", "The Kardashians", "The Jenners"], correctIndex: 2 },
    { key: "pc7", question: "What year did the first iPhone launch?", choices: ["2005", "2007", "2009", "2010"], correctIndex: 1 },
    { key: "pc8", question: "Who slapped Chris Rock at the 2022 Oscars?", choices: ["Denzel Washington", "Will Smith", "Jamie Foxx", "Kevin Hart"], correctIndex: 1 },
    { key: "pc9", question: "What word did Merriam-Webster name Word of the Year in 2023?", choices: ["Authentic", "Rizz", "Vibe", "Gaslighting"], correctIndex: 0 },
    { key: "pc10", question: "Which streamer became the first to reach 100 million followers on TikTok?", choices: ["Addison Rae", "Khaby Lame", "Charli D'Amelio", "MrBeast"], correctIndex: 2 },
    { key: "pc11", question: "What is the name of Beyoncé's fanbase?", choices: ["Beliebers", "Swifties", "The BeyHive", "Little Monsters"], correctIndex: 2 },
  ],
  Movies: [
    { key: "mv1", question: "Who directed the 1994 film Pulp Fiction?", choices: ["Martin Scorsese", "Quentin Tarantino", "Christopher Nolan", "Spike Lee"], correctIndex: 1 },
    { key: "mv2", question: "Which film won Best Picture at the 2020 Oscars?", choices: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"], correctIndex: 2 },
    { key: "mv3", question: "Who plays Iron Man in the MCU?", choices: ["Chris Evans", "Robert Downey Jr.", "Mark Ruffalo", "Chris Hemsworth"], correctIndex: 1 },
    { key: "mv4", question: "What is the highest-grossing film of all time (unadjusted)?", choices: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars: The Force Awakens"], correctIndex: 0 },
    { key: "mv5", question: "In The Godfather, what is the family's last name?", choices: ["Tattaglia", "Barzini", "Corleone", "Cuneo"], correctIndex: 2 },
    { key: "mv6", question: "Who directed Inception and Interstellar?", choices: ["Denis Villeneuve", "Christopher Nolan", "Ridley Scott", "Steven Spielberg"], correctIndex: 1 },
    { key: "mv7", question: "What is the name of the wizarding school in Harry Potter?", choices: ["Ilvermorny", "Beauxbatons", "Durmstrang", "Hogwarts"], correctIndex: 3 },
    { key: "mv8", question: "Which animated film features the song 'Let It Go'?", choices: ["Moana", "Tangled", "Frozen", "Encanto"], correctIndex: 2 },
    { key: "mv9", question: "Who directed Jaws (1975)?", choices: ["George Lucas", "Francis Ford Coppola", "Steven Spielberg", "Brian De Palma"], correctIndex: 2 },
    { key: "mv10", question: "In The Matrix, what color pill does Neo take?", choices: ["Blue", "Red", "Green", "Yellow"], correctIndex: 1 },
    { key: "mv11", question: "Which film features the quote 'I'll be back'?", choices: ["Predator", "The Terminator", "Total Recall", "Commando"], correctIndex: 1 },
  ],
  TV: [
    { key: "tv1", question: "In Breaking Bad, what is Walter White's chemistry teacher alias?", choices: ["Heisenberg", "Schrader", "Pinkman", "Mr. White"], correctIndex: 0 },
    { key: "tv2", question: "What is the name of the coffee shop in Friends?", choices: ["Central Perk", "Java Joe's", "The Grind", "Perk Up"], correctIndex: 0 },
    { key: "tv3", question: "In Game of Thrones, who kills the Night King?", choices: ["Jon Snow", "Daenerys", "Arya Stark", "Bran"], correctIndex: 2 },
    { key: "tv4", question: "Which Netflix show features the Upside Down?", choices: ["Dark", "Stranger Things", "The OA", "Wednesday"], correctIndex: 1 },
    { key: "tv5", question: "In The Office (US), what is the name of the paper company?", choices: ["Staples", "Dunder Mifflin", "Michael Scott Paper", "Sabre"], correctIndex: 1 },
    { key: "tv6", question: "Who is the main character of Better Call Saul?", choices: ["Walter White", "Jimmy McGill", "Mike Ehrmantraut", "Gus Fring"], correctIndex: 1 },
    { key: "tv7", question: "What HBO show is based on the Westeros continent?", choices: ["Rome", "House of the Dragon", "The Last of Us", "Succession"], correctIndex: 1 },
    { key: "tv8", question: "In Squid Game, what is the prize money in Korean won (approx)?", choices: ["4.56 billion", "45.6 billion", "456 million", "45.6 million"], correctIndex: 1 },
    { key: "tv9", question: "Which sitcom features Sheldon Cooper?", choices: ["How I Met Your Mother", "The Big Bang Theory", "Community", "Modern Family"], correctIndex: 1 },
    { key: "tv10", question: "What is the longest-running American animated sitcom?", choices: ["Family Guy", "South Park", "The Simpsons", "American Dad"], correctIndex: 2 },
    { key: "tv11", question: "In Ted Lasso, what team does Ted coach?", choices: ["AFC Richmond", "West Ham", "Manchester City", "Chelsea"], correctIndex: 0 },
  ],
  Music: [
    { key: "ms1", question: "Which band released the album 'Abbey Road' in 1969?", choices: ["The Rolling Stones", "The Beatles", "Led Zeppelin", "The Who"], correctIndex: 1 },
    { key: "ms2", question: "Who is known as the 'King of Pop'?", choices: ["Elvis Presley", "Michael Jackson", "Prince", "Justin Timberlake"], correctIndex: 1 },
    { key: "ms3", question: "How many Grammy Awards has Beyoncé won (most all-time as of 2024)?", choices: ["28", "32", "35", "40"], correctIndex: 1 },
    { key: "ms4", question: "Which Taylor Swift album was released in 2022?", choices: ["Folklore", "Evermore", "Midnights", "Lover"], correctIndex: 2 },
    { key: "ms5", question: "Who sang 'Bohemian Rhapsody'?", choices: ["Led Zeppelin", "Queen", "The Who", "Pink Floyd"], correctIndex: 1 },
    { key: "ms6", question: "What is BTS's fandom called?", choices: ["ARMY", "BLINK", "ONCE", "STAY"], correctIndex: 0 },
    { key: "ms7", question: "Which rapper released 'good kid, m.A.A.d city'?", choices: ["Drake", "J. Cole", "Kendrick Lamar", "Kanye West"], correctIndex: 2 },
    { key: "ms8", question: "Who produced the album 'Thriller' with Michael Jackson?", choices: ["Rick Rubin", "Quincy Jones", "Dr. Dre", "Timbaland"], correctIndex: 1 },
    { key: "ms9", question: "What instrument is Yo-Yo Ma famous for?", choices: ["Violin", "Piano", "Cello", "Flute"], correctIndex: 2 },
    { key: "ms10", question: "Which artist headlined the 2023 Super Bowl halftime show?", choices: ["The Weeknd", "Rihanna", "Dr. Dre", "Usher"], correctIndex: 1 },
    { key: "ms11", question: "What genre is Bad Bunny best known for?", choices: ["K-pop", "Reggaeton", "Country", "EDM"], correctIndex: 1 },
  ],
};

function toQuestion(m: Omit<Mock, "category">, category: string, i: number): Question {
  return {
    id: `mock-${category}-${m.key}`,
    quizNumber: 0,
    order: i,
    question: m.question,
    choices: m.choices,
    correctIndex: m.correctIndex,
    category,
  };
}

export function getMockPool(category: string | null): Question[] {
  if (!category || category === "All Fandoms") {
    return Object.entries(raw).flatMap(([cat, items]) =>
      items.map((m, i) => toQuestion(m, cat, i)),
    );
  }
  const items = raw[category];
  if (!items) return [];
  return items.map((m, i) => toQuestion(m, category, i));
}