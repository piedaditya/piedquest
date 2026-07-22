import type { Question } from "./quiz-queries";

export const REGIONS = ["Global", "India", "USA", "UK"] as const;
export type Region = (typeof REGIONS)[number];

type Mock = { key: string; question: string; choices: string[]; correctIndex: number };

const moviesByRegion: Record<Region, Mock[]> = {
  Global: [
    { key: "mg1", question: "Which film won the Palme d'Or in 2019?", choices: ["Roma", "Parasite", "Shoplifters", "The Square"], correctIndex: 1 },
    { key: "mg2", question: "Which studio produced 'Spirited Away'?", choices: ["Studio Ghibli", "Toei", "Madhouse", "Bones"], correctIndex: 0 },
    { key: "mg3", question: "Who directed 'Amélie' (2001)?", choices: ["Luc Besson", "Jean-Pierre Jeunet", "François Truffaut", "Michel Gondry"], correctIndex: 1 },
    { key: "mg4", question: "'City of God' (2002) is set in which country?", choices: ["Argentina", "Mexico", "Brazil", "Colombia"], correctIndex: 2 },
    { key: "mg5", question: "Which language is 'Roma' (2018) primarily in?", choices: ["Portuguese", "Spanish", "Italian", "French"], correctIndex: 1 },
    { key: "mg6", question: "Who directed 'Oldboy' (2003)?", choices: ["Bong Joon-ho", "Park Chan-wook", "Kim Ki-duk", "Lee Chang-dong"], correctIndex: 1 },
    { key: "mg7", question: "'Life is Beautiful' (1997) is from which country?", choices: ["Spain", "France", "Italy", "Germany"], correctIndex: 2 },
    { key: "mg8", question: "First non-English film to win Best Picture Oscar?", choices: ["Amour", "Roma", "Parasite", "Crouching Tiger"], correctIndex: 2 },
    { key: "mg9", question: "Who directed the 'Three Colors' trilogy?", choices: ["Krzysztof Kieślowski", "Andrzej Wajda", "Roman Polanski", "Agnieszka Holland"], correctIndex: 0 },
    { key: "mg10", question: "'Pan's Labyrinth' was directed by?", choices: ["Alfonso Cuarón", "Alejandro Iñárritu", "Guillermo del Toro", "Pedro Almodóvar"], correctIndex: 2 },
    { key: "mg11", question: "Highest-grossing film franchise ever?", choices: ["Star Wars", "MCU", "Harry Potter", "James Bond"], correctIndex: 1 },
  ],
  India: [
    { key: "min1", question: "Who directed 'Bajrangi Bhaijaan' (2015)?", choices: ["Rajkumar Hirani", "Kabir Khan", "Rohit Shetty", "Karan Johar"], correctIndex: 1 },
    { key: "min2", question: "'Sholay' (1975) was directed by?", choices: ["Yash Chopra", "Ramesh Sippy", "Raj Kapoor", "Manmohan Desai"], correctIndex: 1 },
    { key: "min3", question: "Which Indian song won the 2023 Best Original Song Oscar?", choices: ["Jai Ho", "Naatu Naatu", "Chaiyya Chaiyya", "Kal Ho Naa Ho"], correctIndex: 1 },
    { key: "min4", question: "Who directed 'Baahubali: The Beginning'?", choices: ["S. S. Rajamouli", "Mani Ratnam", "Shankar", "Prabhas"], correctIndex: 0 },
    { key: "min5", question: "India's first talkie film (1931) was?", choices: ["Raja Harishchandra", "Alam Ara", "Devdas", "Kismet"], correctIndex: 1 },
    { key: "min6", question: "Satyajit Ray's 'Pather Panchali' released in?", choices: ["1951", "1955", "1960", "1965"], correctIndex: 1 },
    { key: "min7", question: "Which actor is 'Thalaiva' of Tamil cinema?", choices: ["Kamal Haasan", "Rajinikanth", "Vijay", "Ajith"], correctIndex: 1 },
    { key: "min8", question: "'3 Idiots' (2009) was directed by?", choices: ["Rajkumar Hirani", "Anurag Kashyap", "Farhan Akhtar", "Imtiaz Ali"], correctIndex: 0 },
    { key: "min9", question: "Telugu cinema is based in which city?", choices: ["Chennai", "Hyderabad", "Bangalore", "Mumbai"], correctIndex: 1 },
    { key: "min10", question: "Who composed the score for 'Roja' (1992)?", choices: ["Ilaiyaraaja", "A. R. Rahman", "R. D. Burman", "S. D. Burman"], correctIndex: 1 },
    { key: "min11", question: "'Lagaan' (2001) was nominated for which Oscar?", choices: ["Best Picture", "Best Foreign Language Film", "Best Director", "Best Song"], correctIndex: 1 },
  ],
  USA: [
    { key: "mus1", question: "Who directed 'Citizen Kane' (1941)?", choices: ["Orson Welles", "John Ford", "Alfred Hitchcock", "Frank Capra"], correctIndex: 0 },
    { key: "mus2", question: "'The Godfather' (1972) is set primarily in?", choices: ["Chicago", "New York", "Boston", "Los Angeles"], correctIndex: 1 },
    { key: "mus3", question: "Who directed 'Do the Right Thing' (1989)?", choices: ["Spike Lee", "John Singleton", "Jordan Peele", "Barry Jenkins"], correctIndex: 0 },
    { key: "mus4", question: "'Moonlight' won Best Picture in?", choices: ["2015", "2016", "2017", "2018"], correctIndex: 2 },
    { key: "mus5", question: "Hollywood is in which US state?", choices: ["New York", "California", "Nevada", "Florida"], correctIndex: 1 },
    { key: "mus6", question: "Who directed 'Get Out' (2017)?", choices: ["Ava DuVernay", "Jordan Peele", "Ryan Coogler", "Barry Jenkins"], correctIndex: 1 },
    { key: "mus7", question: "'Mission: Impossible' features which hero?", choices: ["Bourne", "Ethan Hunt", "James Bond", "Jack Ryan"], correctIndex: 1 },
    { key: "mus8", question: "Who wrote and directed 'Lady Bird' (2017)?", choices: ["Sofia Coppola", "Greta Gerwig", "Kathryn Bigelow", "Chloé Zhao"], correctIndex: 1 },
    { key: "mus9", question: "AFI's #1 film in 100 Years...100 Movies?", choices: ["The Godfather", "Casablanca", "Citizen Kane", "Gone with the Wind"], correctIndex: 2 },
    { key: "mus10", question: "'Nomadland' (2020) director?", choices: ["Chloé Zhao", "Kelly Reichardt", "Sofia Coppola", "Ava DuVernay"], correctIndex: 0 },
    { key: "mus11", question: "Which studio released 'Titanic' (1997)?", choices: ["Warner Bros.", "Paramount / 20th Century Fox", "Universal", "Sony"], correctIndex: 1 },
  ],
  UK: [
    { key: "muk1", question: "Who directed 'Trainspotting' (1996)?", choices: ["Guy Ritchie", "Danny Boyle", "Ken Loach", "Mike Leigh"], correctIndex: 1 },
    { key: "muk2", question: "'Four Weddings and a Funeral' starred?", choices: ["Colin Firth", "Hugh Grant", "Jude Law", "Ewan McGregor"], correctIndex: 1 },
    { key: "muk3", question: "Ealing comedy with Alec Guinness in many roles?", choices: ["The Ladykillers", "Kind Hearts and Coronets", "Passport to Pimlico", "The Lavender Hill Mob"], correctIndex: 1 },
    { key: "muk4", question: "Who directed 'The King's Speech' (2010)?", choices: ["Tom Hooper", "Sam Mendes", "Danny Boyle", "Stephen Frears"], correctIndex: 0 },
    { key: "muk5", question: "Which British film won Best Picture in 2009?", choices: ["The King's Speech", "Slumdog Millionaire", "The Queen", "Atonement"], correctIndex: 1 },
    { key: "muk6", question: "'Notting Hill' (1999) is set in?", choices: ["Manchester", "London", "Edinburgh", "Liverpool"], correctIndex: 1 },
    { key: "muk7", question: "Who directed '1917' (2019)?", choices: ["Christopher Nolan", "Sam Mendes", "Ridley Scott", "Kenneth Branagh"], correctIndex: 1 },
    { key: "muk8", question: "Ken Loach film that won the 2016 Palme d'Or?", choices: ["I, Daniel Blake", "Kes", "The Wind That Shakes the Barley", "Sorry We Missed You"], correctIndex: 0 },
    { key: "muk9", question: "'Shaun of the Dead' was directed by?", choices: ["Guy Ritchie", "Edgar Wright", "Matthew Vaughn", "Nick Park"], correctIndex: 1 },
    { key: "muk10", question: "Studio behind Wallace & Gromit?", choices: ["Aardman", "Working Title", "BBC Films", "Film4"], correctIndex: 0 },
    { key: "muk11", question: "Who directed 'Atonement' (2007)?", choices: ["Joe Wright", "Tom Hooper", "Sam Mendes", "Danny Boyle"], correctIndex: 0 },
  ],
};

const gkWorld: Mock[] = [
  { key: "gw1", question: "Where is the Eiffel Tower situated?", choices: ["Rome", "Paris", "Berlin", "Madrid"], correctIndex: 1 },
  { key: "gw2", question: "Which is the largest ocean on Earth?", choices: ["Atlantic", "Indian", "Arctic", "Pacific"], correctIndex: 3 },
  { key: "gw3", question: "The Great Wall is located in which country?", choices: ["Japan", "China", "Mongolia", "Korea"], correctIndex: 1 },
  { key: "gw4", question: "Which planet is known as the Red Planet?", choices: ["Venus", "Jupiter", "Mars", "Mercury"], correctIndex: 2 },
  { key: "gw5", question: "Who painted the Mona Lisa?", choices: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"], correctIndex: 1 },
  { key: "gw6", question: "What is the currency of Japan?", choices: ["Won", "Yuan", "Yen", "Ringgit"], correctIndex: 2 },
  { key: "gw7", question: "The Amazon rainforest is primarily in?", choices: ["Peru", "Colombia", "Brazil", "Venezuela"], correctIndex: 2 },
  { key: "gw8", question: "Mount Everest borders Nepal and…?", choices: ["India", "China (Tibet)", "Bhutan", "Pakistan"], correctIndex: 1 },
  { key: "gw9", question: "Kangaroos are native to?", choices: ["New Zealand", "South Africa", "Australia", "Argentina"], correctIndex: 2 },
  { key: "gw10", question: "Who invented the telephone?", choices: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Guglielmo Marconi"], correctIndex: 1 },
  { key: "gw11", question: "UN headquarters is in?", choices: ["Geneva", "New York", "Vienna", "Paris"], correctIndex: 1 },
  { key: "gw12", question: "How many continents are there?", choices: ["5", "6", "7", "8"], correctIndex: 2 },
  { key: "gw13", question: "Smallest country by area?", choices: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], correctIndex: 1 },
  { key: "gw14", question: "Statue of Liberty was a gift from?", choices: ["UK", "Spain", "France", "Netherlands"], correctIndex: 2 },
];

const gkRegional: Record<Region, Mock[]> = {
  Global: gkWorld,
  India: [
    { key: "gin1", question: "Who was the first President of India?", choices: ["Rajendra Prasad", "S. Radhakrishnan", "Zakir Husain", "V. V. Giri"], correctIndex: 0 },
    { key: "gin2", question: "In which year did India gain independence?", choices: ["1945", "1946", "1947", "1950"], correctIndex: 2 },
    { key: "gin3", question: "Who drafted the Indian Constitution?", choices: ["Nehru", "B. R. Ambedkar", "Sardar Patel", "Rajendra Prasad"], correctIndex: 1 },
    { key: "gin4", question: "The Battle of Plassey was fought in?", choices: ["1757", "1764", "1857", "1707"], correctIndex: 0 },
    { key: "gin5", question: "Longest river in India?", choices: ["Yamuna", "Brahmaputra", "Ganga", "Godavari"], correctIndex: 2 },
    { key: "gin6", question: "Indian Parliament has how many houses?", choices: ["One", "Two", "Three", "Four"], correctIndex: 1 },
    { key: "gin7", question: "'Father of the Indian Constitution'?", choices: ["Gandhi", "B. R. Ambedkar", "Nehru", "Patel"], correctIndex: 1 },
    { key: "gin8", question: "Non-Cooperation Movement was launched in?", choices: ["1919", "1920", "1930", "1942"], correctIndex: 1 },
    { key: "gin9", question: "Largest Indian state by area?", choices: ["Madhya Pradesh", "Rajasthan", "Maharashtra", "Uttar Pradesh"], correctIndex: 1 },
    { key: "gin10", question: "'Quit India' movement began in?", choices: ["1940", "1942", "1944", "1945"], correctIndex: 1 },
    { key: "gin11", question: "First woman PM of India?", choices: ["Sarojini Naidu", "Indira Gandhi", "Pratibha Patil", "Sonia Gandhi"], correctIndex: 1 },
    { key: "gin12", question: "Which Article abolishes untouchability?", choices: ["14", "17", "21", "32"], correctIndex: 1 },
    { key: "gin13", question: "Tropic of Cancer passes through how many Indian states?", choices: ["6", "7", "8", "9"], correctIndex: 2 },
    { key: "gin14", question: "Who founded the Maurya Empire?", choices: ["Ashoka", "Chandragupta Maurya", "Bindusara", "Bimbisara"], correctIndex: 1 },
  ],
  USA: [
    { key: "gus1", question: "First US President?", choices: ["Jefferson", "George Washington", "John Adams", "Madison"], correctIndex: 1 },
    { key: "gus2", question: "Declaration of Independence signed in?", choices: ["1774", "1775", "1776", "1783"], correctIndex: 2 },
    { key: "gus3", question: "How many amendments in the Bill of Rights?", choices: ["5", "8", "10", "12"], correctIndex: 2 },
    { key: "gus4", question: "US Civil War ended in?", choices: ["1861", "1865", "1870", "1877"], correctIndex: 1 },
    { key: "gus5", question: "Document that begins 'We the People'?", choices: ["Declaration of Independence", "US Constitution", "Bill of Rights", "Emancipation Proclamation"], correctIndex: 1 },
    { key: "gus6", question: "Last state admitted to the Union?", choices: ["Alaska", "Hawaii", "Arizona", "New Mexico"], correctIndex: 1 },
    { key: "gus7", question: "Louisiana Purchase (1803) was from?", choices: ["Spain", "Britain", "France", "Mexico"], correctIndex: 2 },
    { key: "gus8", question: "Main author of the Declaration of Independence?", choices: ["Franklin", "Jefferson", "Adams", "Madison"], correctIndex: 1 },
    { key: "gus9", question: "River forming much of the US–Mexico border?", choices: ["Colorado", "Rio Grande", "Mississippi", "Missouri"], correctIndex: 1 },
    { key: "gus10", question: "Stars on the US flag?", choices: ["48", "49", "50", "52"], correctIndex: 2 },
    { key: "gus11", question: "Federal Reserve established in?", choices: ["1901", "1913", "1929", "1944"], correctIndex: 1 },
    { key: "gus12", question: "Branch that interprets laws?", choices: ["Executive", "Legislative", "Judicial", "Cabinet"], correctIndex: 2 },
    { key: "gus13", question: "19th Amendment (1920) granted?", choices: ["Abolition of slavery", "Women's suffrage", "Prohibition", "Income tax"], correctIndex: 1 },
    { key: "gus14", question: "President who issued the Emancipation Proclamation?", choices: ["Grant", "Lincoln", "Johnson", "Jefferson"], correctIndex: 1 },
  ],
  UK: [
    { key: "guk1", question: "Current UK monarch (as of 2026)?", choices: ["Elizabeth II", "Charles III", "William V", "George VII"], correctIndex: 1 },
    { key: "guk2", question: "Magna Carta signed in?", choices: ["1066", "1215", "1415", "1649"], correctIndex: 1 },
    { key: "guk3", question: "First female UK Prime Minister?", choices: ["Theresa May", "Margaret Thatcher", "Liz Truss", "Angela Merkel"], correctIndex: 1 },
    { key: "guk4", question: "UK Parliament sits at?", choices: ["Downing Street", "Westminster", "Buckingham Palace", "Whitehall"], correctIndex: 1 },
    { key: "guk5", question: "1066 battle that established Norman rule?", choices: ["Bosworth", "Hastings", "Agincourt", "Trafalgar"], correctIndex: 1 },
    { key: "guk6", question: "Countries in the United Kingdom?", choices: ["2", "3", "4", "5"], correctIndex: 2 },
    { key: "guk7", question: "Industrial Revolution began primarily in?", choices: ["France", "Germany", "United Kingdom", "USA"], correctIndex: 2 },
    { key: "guk8", question: "Bank of England was founded in?", choices: ["1594", "1694", "1794", "1894"], correctIndex: 1 },
    { key: "guk9", question: "UK PM during WWII?", choices: ["Chamberlain", "Winston Churchill", "Attlee", "Wilson"], correctIndex: 1 },
    { key: "guk10", question: "River Thames flows through?", choices: ["Birmingham", "Manchester", "London", "Liverpool"], correctIndex: 2 },
    { key: "guk11", question: "Act that united England & Scotland in 1707?", choices: ["Act of Supremacy", "Act of Union", "Bill of Rights", "Reform Act"], correctIndex: 1 },
    { key: "guk12", question: "BBC was founded in?", choices: ["1912", "1922", "1932", "1942"], correctIndex: 1 },
    { key: "guk13", question: "Longest-reigning UK monarch?", choices: ["Victoria", "Elizabeth II", "George III", "Henry VIII"], correctIndex: 1 },
    { key: "guk14", question: "Good Friday Agreement (1998) concerned?", choices: ["Scotland", "Wales", "Northern Ireland", "Cornwall"], correctIndex: 2 },
  ],
};

function toQ(m: Mock, category: string, i: number): Question {
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

export function getRegionalMovies(region: Region): Question[] {
  const list = moviesByRegion[region] ?? moviesByRegion.Global;
  return list.map((m, i) => toQ(m, "Movies", i));
}

export function getGKWorld(): Question[] {
  return gkWorld.map((m, i) => toQ(m, "GK World", i));
}

export function getGKRegional(region: Region): Question[] {
  const list = gkRegional[region] ?? gkRegional.Global;
  return list.map((m, i) => toQ(m, "GK Regional", i));
}
