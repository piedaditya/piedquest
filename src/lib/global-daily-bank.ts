// Universal, non-regional, educational question bank for the Global Daily
// Challenge. Strictly graded: easy -> medium -> hard -> extreme.
// Every entry carries a "Knowledge Nugget" explanation.

export type Tier = "easy" | "medium" | "hard" | "extreme";

export interface BankQuestion {
  q: string;
  choices: string[];
  correct: number; // index into choices as authored
  topic: string;
  nugget: string;
}

export const EASY_BANK: BankQuestion[] = [
  { q: "What does the 'www' in a website address stand for?", choices: ["World Wide Web", "Web Wire Work", "Wide World Watch", "Web Wide World"], correct: 0, topic: "Internet", nugget: "The World Wide Web was invented by Tim Berners-Lee at CERN in 1989 as a way to link documents over the internet — the web runs on the internet, it isn't the internet itself." },
  { q: "Which letters appear on the top-left of a standard English keyboard?", choices: ["QWERTY", "ASDFGH", "ABCDEF", "ZXCVBN"], correct: 0, topic: "Tech", nugget: "The QWERTY layout dates to 1870s typewriters; it spaced out common letter pairs to stop mechanical typebars from jamming." },
  { q: "How many degrees are there in a right angle?", choices: ["90", "45", "180", "60"], correct: 0, topic: "Mathematics", nugget: "A full turn is 360°, so a quarter turn is 90°. The 360 comes from ancient Babylonian base-60 counting." },
  { q: "What gas do humans need to breathe in to survive?", choices: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], correct: 0, topic: "Science", nugget: "Air is about 78% nitrogen and only 21% oxygen — your cells use that oxygen to release energy from food in a process called respiration." },
  { q: "Which planet is closest to the Sun?", choices: ["Mercury", "Venus", "Earth", "Mars"], correct: 0, topic: "Space", nugget: "Mercury is closest, but Venus is hotter — its thick CO2 atmosphere traps heat at around 465°C." },
  { q: "What does 'AI' stand for in technology?", choices: ["Artificial Intelligence", "Automated Input", "Advanced Interface", "Applied Informatics"], correct: 0, topic: "AI", nugget: "The term 'artificial intelligence' was coined at the 1956 Dartmouth workshop, decades before the computing power existed to make it practical." },
  { q: "Which ocean is the largest on Earth?", choices: ["Pacific", "Atlantic", "Indian", "Arctic"], correct: 0, topic: "Geography", nugget: "The Pacific covers about a third of the planet's surface — larger than all land area combined." },
  { q: "How many sides does a hexagon have?", choices: ["6", "5", "7", "8"], correct: 0, topic: "Mathematics", nugget: "Hexagons tile a plane with no gaps using the least perimeter — which is why honeybees build hexagonal cells." },
  { q: "What is the chemical symbol for water?", choices: ["H2O", "CO2", "O2", "NaCl"], correct: 0, topic: "Science", nugget: "Two hydrogen atoms bond to one oxygen at a 104.5° angle, making the molecule polar — the reason water dissolves so many substances." },
  { q: "Which device converts electrical energy into light?", choices: ["Lamp", "Microphone", "Battery", "Thermostat"], correct: 0, topic: "Tech", nugget: "Modern LEDs emit light when electrons drop energy levels in a semiconductor, wasting far less energy as heat than filament bulbs." },
  { q: "In computing, what does 'CPU' stand for?", choices: ["Central Processing Unit", "Computer Power Unit", "Central Program Utility", "Core Peripheral Unit"], correct: 0, topic: "Tech", nugget: "The CPU executes instructions one clock tick at a time; a 3 GHz chip ticks three billion times per second." },
  { q: "What is 15% of 200?", choices: ["30", "25", "35", "20"], correct: 0, topic: "Mathematics", nugget: "A fast trick: 10% is 20, half of that (5%) is 10, so 15% = 30. Splitting percentages into 10s and 5s makes mental math easy." },
  { q: "Which is the longest river commonly cited in the world?", choices: ["The Nile", "The Thames", "The Danube", "The Rhine"], correct: 0, topic: "Geography", nugget: "The Nile (~6,650 km) and the Amazon trade the title depending on how the source is measured — the Amazon carries far more water." },
  { q: "What does a 'search engine' primarily do?", choices: ["Index and rank web pages", "Store your files", "Build websites", "Encrypt emails"], correct: 0, topic: "Internet", nugget: "Search engines crawl pages, store them in an index, then rank results by relevance signals like links and content quality." },
  { q: "Which unit measures digital storage?", choices: ["Gigabyte", "Hertz", "Watt", "Newton"], correct: 0, topic: "Tech", nugget: "One byte is 8 bits, enough for a single character; a gigabyte is roughly a billion of those." },
  { q: "What force keeps us on the ground?", choices: ["Gravity", "Magnetism", "Friction", "Inertia"], correct: 0, topic: "Science", nugget: "Gravity is the weakest of the four fundamental forces, but it acts over infinite range and never cancels out — so at planetary scale it dominates." },
  { q: "Which continent is the Sahara Desert in?", choices: ["Africa", "Asia", "Australia", "South America"], correct: 0, topic: "Geography", nugget: "The Sahara is roughly the size of the United States and is still growing along its southern edge." },
  { q: "What does 'password' protect on a device?", choices: ["Access to your account", "Battery life", "Screen brightness", "Network speed"], correct: 0, topic: "Security", nugget: "Length beats complexity: a long passphrase is harder to crack than a short password with symbols, because attacks scale with total combinations." },
];

export const MEDIUM_BANK: BankQuestion[] = [
  { q: "What does 'HTTP' stand for?", choices: ["HyperText Transfer Protocol", "High Transfer Text Process", "Hyperlink Text Transport Path", "Host Transfer Type Protocol"], correct: 0, topic: "Internet", nugget: "HTTPS is the same protocol wrapped in TLS encryption, so eavesdroppers see only scrambled bytes." },
  { q: "Which number system does a computer use at the hardware level?", choices: ["Binary", "Decimal", "Roman", "Hexadecimal"], correct: 0, topic: "Tech", nugget: "Transistors have two stable states — on and off — which maps naturally onto 1 and 0." },
  { q: "What is the square root of 144?", choices: ["12", "14", "16", "11"], correct: 0, topic: "Mathematics", nugget: "144 is 12², and it's also the 12th Fibonacci number — the only Fibonacci number besides 1 that is a perfect square." },
  { q: "In machine learning, what is 'training data'?", choices: ["Examples a model learns patterns from", "The model's source code", "The server it runs on", "Its final accuracy score"], correct: 0, topic: "AI", nugget: "Models generalize from patterns in training data — biased data produces biased models, which is why data curation matters more than model size." },
  { q: "Which layer of Earth do we live on?", choices: ["Crust", "Mantle", "Outer core", "Inner core"], correct: 0, topic: "Science", nugget: "The crust is only 5–70 km thick — proportionally thinner than an apple's skin." },
  { q: "What does 'IP address' identify?", choices: ["A device on a network", "A website's owner", "An email password", "A file type"], correct: 0, topic: "Internet", nugget: "IPv4 has ~4.3 billion addresses, which ran out — IPv6 offers about 3.4×10³⁸, enough for every grain of sand many times over." },
  { q: "Roughly what percentage of Earth's surface is covered by water?", choices: ["71%", "50%", "85%", "60%"], correct: 0, topic: "Geography", nugget: "About 97% of that water is saltwater; only ~1% of all water is accessible fresh water." },
  { q: "What is the speed of light in a vacuum (approx.)?", choices: ["300,000 km/s", "300,000 km/h", "30,000 km/s", "3,000,000 km/s"], correct: 0, topic: "Physics", nugget: "Because light takes time to travel, looking at distant stars is literally looking into the past." },
  { q: "What does 'RAM' do in a computer?", choices: ["Holds data currently in use", "Stores files permanently", "Cools the processor", "Connects to the internet"], correct: 0, topic: "Tech", nugget: "RAM is volatile — it loses everything on power-off, which is why unsaved work disappears in a crash." },
  { q: "Which is a prime number?", choices: ["29", "27", "33", "51"], correct: 0, topic: "Mathematics", nugget: "27 = 3³, 33 = 3×11, 51 = 3×17. A quick test: if digits sum to a multiple of 3, the number is divisible by 3." },
  { q: "What is photosynthesis' main output for animals?", choices: ["Oxygen", "Nitrogen", "Methane", "Ozone"], correct: 0, topic: "Biology", nugget: "Plants and ocean phytoplankton produce most of the oxygen we breathe — plankton alone account for roughly half." },
  { q: "What does 'open source' software mean?", choices: ["Its source code is public and reusable", "It is always free of bugs", "It has no license", "It only runs on Linux"], correct: 0, topic: "Tech", nugget: "Open-source licenses set the rules; permissive ones like MIT allow commercial reuse, while copyleft ones like GPL require sharing changes." },
  { q: "Which country has the largest land area?", choices: ["Russia", "Canada", "China", "United States"], correct: 0, topic: "Geography", nugget: "Russia spans 11 time zones and about 11% of the world's land area." },
  { q: "What is a 'cloud server' physically?", choices: ["A computer in a data center", "Software on your phone", "A satellite", "A type of Wi-Fi router"], correct: 0, topic: "Tech", nugget: "The cloud is just someone else's computer — real machines in warehouses drawing real electricity." },
  { q: "In statistics, what does the 'median' represent?", choices: ["The middle value", "The average", "The most frequent value", "The range"], correct: 0, topic: "Mathematics", nugget: "The median resists outliers, which is why incomes are usually reported as medians rather than averages." },
  { q: "What does DNA primarily store?", choices: ["Genetic instructions", "Energy", "Oxygen", "Proteins"], correct: 0, topic: "Biology", nugget: "The human genome holds ~3 billion base pairs — about 750 MB of raw data, less than a CD." },
  { q: "What is 'phishing' in cybersecurity?", choices: ["Tricking users into revealing credentials", "Overloading a server", "Physically stealing a laptop", "Encrypting files for ransom"], correct: 0, topic: "Security", nugget: "Most breaches start with a person, not a firewall — phishing exploits trust and urgency rather than code flaws." },
  { q: "Which invention most directly enabled mass literacy in Europe?", choices: ["The printing press", "The telescope", "The steam engine", "The compass"], correct: 0, topic: "History", nugget: "Gutenberg's movable type (c. 1440) cut the cost of books dramatically, spreading ideas faster than any authority could control." },
];

export const HARD_BANK: BankQuestion[] = [
  { q: "In Big-O notation, what is the average time complexity of binary search?", choices: ["O(log n)", "O(n)", "O(n log n)", "O(1)"], correct: 0, topic: "Computer Science", nugget: "Each comparison halves the search space, so a billion sorted items need only about 30 checks." },
  { q: "What does a neural network's 'weight' actually represent?", choices: ["The strength of a connection between neurons", "The model's file size", "The number of layers", "The learning rate"], correct: 0, topic: "AI", nugget: "Training means nudging millions of weights via gradient descent until predictions stop improving." },
  { q: "What is the value of 2^10?", choices: ["1024", "1000", "512", "2048"], correct: 0, topic: "Mathematics", nugget: "That 1024 is why a 'kilobyte' historically meant 1024 bytes rather than 1000 — powers of two dominate computing." },
  { q: "Which protocol translates domain names into IP addresses?", choices: ["DNS", "FTP", "SMTP", "TCP"], correct: 0, topic: "Internet", nugget: "DNS is the internet's phonebook; when it fails, sites feel 'down' even though their servers are running fine." },
  { q: "What does the second law of thermodynamics state about entropy in an isolated system?", choices: ["It never decreases", "It always decreases", "It stays exactly constant", "It oscillates"], correct: 0, topic: "Physics", nugget: "This law gives time its direction — it's why heat flows from hot to cold and why perpetual motion machines can't exist." },
  { q: "In cryptography, what makes public-key encryption work?", choices: ["Mathematically linked key pairs", "Sharing one secret password", "Hiding the algorithm", "Compressing the message"], correct: 0, topic: "Security", nugget: "RSA relies on the fact that multiplying two large primes is easy but factoring the product is computationally brutal." },
  { q: "Roughly how long does sunlight take to reach Earth?", choices: ["About 8 minutes", "About 8 seconds", "About 1 hour", "Instantly"], correct: 0, topic: "Space", nugget: "At ~150 million km and 300,000 km/s, light takes 8 minutes 20 seconds — you always see the Sun as it was in the past." },
  { q: "What is the derivative of x² with respect to x?", choices: ["2x", "x", "x³/3", "2"], correct: 0, topic: "Mathematics", nugget: "The power rule: bring the exponent down, subtract one. Derivatives measure instantaneous rate of change." },
  { q: "Why is a 'race condition' dangerous in software?", choices: ["Results depend on unpredictable timing", "It slows the CPU clock", "It uses too much disk space", "It blocks network ports"], correct: 0, topic: "Computer Science", nugget: "Race conditions are notoriously hard to reproduce because the bug only appears on certain interleavings of concurrent operations." },
  { q: "What does 'latency' measure in a network?", choices: ["Delay before data transfer begins", "Total bandwidth available", "Number of connected devices", "Packet size"], correct: 0, topic: "Internet", nugget: "Bandwidth is how wide the pipe is; latency is how long the trip takes. Fibre helps both, but distance sets a hard latency floor." },
  { q: "Which element has the atomic number 6?", choices: ["Carbon", "Oxygen", "Nitrogen", "Helium"], correct: 0, topic: "Chemistry", nugget: "Carbon's four bonding slots let it form long chains and rings — the structural basis of all known life." },
  { q: "In probability, if you flip a fair coin 3 times, what is the chance of getting exactly 3 heads?", choices: ["1/8", "1/3", "1/6", "1/4"], correct: 0, topic: "Mathematics", nugget: "Independent events multiply: ½ × ½ × ½ = 1/8. Past flips never influence the next one." },
  { q: "What is 'overfitting' in machine learning?", choices: ["Memorizing training data instead of generalizing", "Using too little data", "Running out of memory", "Training too slowly"], correct: 0, topic: "AI", nugget: "An overfit model scores near-perfectly on training data and poorly on new data — which is why a held-out test set is essential." },
  { q: "Which layer of the atmosphere contains most of the ozone that blocks UV?", choices: ["Stratosphere", "Troposphere", "Mesosphere", "Exosphere"], correct: 0, topic: "Science", nugget: "The 1987 Montreal Protocol phased out CFCs and the ozone layer is measurably recovering — a rare global environmental success." },
];

export const EXTREME_BANK: BankQuestion[] = [
  { q: "What problem does the CAP theorem say distributed systems must trade off during a network partition?", choices: ["Consistency vs availability", "Speed vs storage", "Security vs usability", "Cost vs latency"], correct: 0, topic: "Computer Science", nugget: "During a partition you must choose: refuse requests to stay consistent, or answer with possibly stale data to stay available. You cannot have both." },
  { q: "In the transformer architecture behind modern LLMs, what does the 'attention' mechanism compute?", choices: ["Weighted relevance between tokens", "Image edges", "Compression ratios", "Random dropout masks"], correct: 0, topic: "AI", nugget: "Self-attention lets every token look at every other token at once, which is why transformers parallelize far better than older recurrent networks." },
  { q: "What does Gödel's first incompleteness theorem establish?", choices: ["Some true statements are unprovable within a consistent formal system", "All mathematics is contradictory", "Every theorem has a proof", "Arithmetic is decidable"], correct: 0, topic: "Mathematics", nugget: "Gödel showed in 1931 that any sufficiently powerful, consistent system contains true statements it cannot prove — ending the dream of a complete axiomatization of mathematics." },
  { q: "Why does the halting problem matter in computer science?", choices: ["No algorithm can decide if all programs terminate", "It proves sorting is O(n)", "It defines RAM limits", "It measures CPU heat"], correct: 0, topic: "Computer Science", nugget: "Turing proved in 1936 that a universal halting-checker leads to contradiction — the first hard limit on what computation can ever do." },
  { q: "In relativity, what happens to a moving clock as observed from a stationary frame?", choices: ["It ticks slower", "It ticks faster", "It stops entirely", "It is unchanged"], correct: 0, topic: "Physics", nugget: "Time dilation is measurable: GPS satellites must correct their clocks by tens of microseconds a day or positions would drift kilometres." },
  { q: "What is the Byzantine Generals Problem fundamentally about?", choices: ["Reaching consensus with untrustworthy participants", "Sorting large datasets", "Compressing video", "Balancing server load"], correct: 0, topic: "Computer Science", nugget: "Blockchain consensus mechanisms exist precisely to solve this — agreeing on one truth when some participants may lie or fail." },
  { q: "What does Bayes' theorem let you calculate?", choices: ["Updated probability given new evidence", "The mean of a dataset", "The area under a curve", "Standard deviation"], correct: 0, topic: "Mathematics", nugget: "It's why a positive test for a rare disease often still means you probably don't have it — base rates dominate." },
  { q: "In quantum mechanics, what does Heisenberg's uncertainty principle state?", choices: ["Position and momentum can't both be known precisely", "Energy is always conserved", "Particles have fixed paths", "Light is only a wave"], correct: 0, topic: "Physics", nugget: "It's not a measurement flaw — it's a fundamental property of wave-like matter, and it sets the limit on how small transistors can shrink." },
  { q: "What is the primary reason SHA-256 is considered secure for hashing?", choices: ["It is one-way and collision-resistant", "It is encrypted with a password", "It compresses data losslessly", "It is a secret algorithm"], correct: 0, topic: "Security", nugget: "A hash is irreversible by design; even a one-bit change to the input scrambles the entire output — the avalanche effect." },
  { q: "Which mathematical constant appears in the formula e^(iπ) + 1 = 0 alongside e, i, 1 and 0?", choices: ["π", "φ", "γ", "√2"], correct: 0, topic: "Mathematics", nugget: "Euler's identity links five fundamental constants in one line and is often called the most beautiful equation in mathematics." },
];

export const TIER_PLAN: Tier[] = [
  "easy", "easy", "easy", "easy", "easy",
  "medium", "medium", "medium", "medium", "medium",
  "hard", "hard", "hard",
  "extreme", "extreme",
];

export function bankFor(tier: Tier): BankQuestion[] {
  if (tier === "easy") return EASY_BANK;
  if (tier === "medium") return MEDIUM_BANK;
  if (tier === "hard") return HARD_BANK;
  return EXTREME_BANK;
}
