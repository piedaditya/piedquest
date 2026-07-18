
CREATE TABLE public.daily_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_date DATE NOT NULL,
  quiz_number INT NOT NULL,
  question_order INT NOT NULL CHECK (question_order BETWEEN 1 AND 5),
  question TEXT NOT NULL,
  choices JSONB NOT NULL,
  correct_index INT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quiz_date, question_order)
);

CREATE INDEX idx_daily_questions_date ON public.daily_questions(quiz_date);

GRANT SELECT ON public.daily_questions TO anon;
GRANT SELECT ON public.daily_questions TO authenticated;
GRANT ALL ON public.daily_questions TO service_role;

ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily questions are public"
  ON public.daily_questions
  FOR SELECT
  USING (true);

-- Seed today's quiz (#1) and tomorrow's (#2) so the app has content immediately
INSERT INTO public.daily_questions (quiz_date, quiz_number, question_order, question, choices, correct_index, category) VALUES
(CURRENT_DATE, 1, 1, 'Which house does Harry Potter belong to at Hogwarts?', '["Slytherin","Gryffindor","Ravenclaw","Hufflepuff"]'::jsonb, 1, 'Harry Potter'),
(CURRENT_DATE, 1, 2, 'In Star Wars, who is Luke Skywalker''s father?', '["Obi-Wan Kenobi","Emperor Palpatine","Darth Vader","Han Solo"]'::jsonb, 2, 'Star Wars'),
(CURRENT_DATE, 1, 3, 'What is the name of the coffee shop in Friends?', '["Central Perk","Java Joe''s","The Grind","Perk Up"]'::jsonb, 0, 'Friends'),
(CURRENT_DATE, 1, 4, 'Who is the main antagonist in Breaking Bad''s final season?', '["Tuco","Gus Fring","Walter White","Hank Schrader"]'::jsonb, 2, 'Breaking Bad'),
(CURRENT_DATE, 1, 5, 'What is the name of Sherlock Holmes'' loyal companion?', '["Dr. Watson","Inspector Lestrade","Mycroft","Moriarty"]'::jsonb, 0, 'Sherlock'),

(CURRENT_DATE + INTERVAL '1 day', 2, 1, 'In The Lord of the Rings, what is the name of Frodo''s sword?', '["Anduril","Glamdring","Sting","Orcrist"]'::jsonb, 2, 'LOTR'),
(CURRENT_DATE + INTERVAL '1 day', 2, 2, 'Which Marvel hero wields Mjolnir?', '["Iron Man","Captain America","Thor","Hulk"]'::jsonb, 2, 'Marvel'),
(CURRENT_DATE + INTERVAL '1 day', 2, 3, 'What is the name of the dragon in The Hobbit?', '["Drogon","Smaug","Viserion","Balerion"]'::jsonb, 1, 'The Hobbit'),
(CURRENT_DATE + INTERVAL '1 day', 2, 4, 'In Stranger Things, what is the alternate dimension called?', '["The Void","The Upside Down","The Shadow Realm","The Nether"]'::jsonb, 1, 'Stranger Things'),
(CURRENT_DATE + INTERVAL '1 day', 2, 5, 'Who directed the movie Inception?', '["Steven Spielberg","Christopher Nolan","Denis Villeneuve","James Cameron"]'::jsonb, 1, 'Movies');
