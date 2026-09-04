CREATE TABLE public.question_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  client_key text,
  topic text NOT NULL,
  question_hash text NOT NULL,
  question_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.question_history TO authenticated;
GRANT ALL ON public.question_history TO service_role;

ALTER TABLE public.question_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own question history"
ON public.question_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX question_history_user_created_idx ON public.question_history (user_id, created_at DESC);
CREATE INDEX question_history_client_created_idx ON public.question_history (client_key, created_at DESC);
CREATE INDEX question_history_topic_idx ON public.question_history (topic);