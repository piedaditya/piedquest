CREATE TABLE public.doubt_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id text NOT NULL,
  title text NOT NULL DEFAULT 'New doubt',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX doubt_threads_client_idx ON public.doubt_threads (client_id, updated_at DESC);

CREATE TABLE public.doubt_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid NOT NULL REFERENCES public.doubt_threads(id) ON DELETE CASCADE,
  client_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX doubt_messages_thread_idx ON public.doubt_messages (thread_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.doubt_threads TO anon, authenticated;
GRANT ALL ON public.doubt_threads TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doubt_messages TO anon, authenticated;
GRANT ALL ON public.doubt_messages TO service_role;

ALTER TABLE public.doubt_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubt_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read doubt threads" ON public.doubt_threads FOR SELECT USING (true);
CREATE POLICY "Anyone can create doubt threads" ON public.doubt_threads FOR INSERT WITH CHECK (length(client_id) BETWEEN 8 AND 64 AND length(title) BETWEEN 1 AND 200);
CREATE POLICY "Anyone can update doubt threads" ON public.doubt_threads FOR UPDATE USING (true) WITH CHECK (length(title) BETWEEN 1 AND 200);
CREATE POLICY "Anyone can delete doubt threads" ON public.doubt_threads FOR DELETE USING (true);

CREATE POLICY "Anyone can read doubt messages" ON public.doubt_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can create doubt messages" ON public.doubt_messages FOR INSERT WITH CHECK (length(client_id) BETWEEN 8 AND 64 AND length(content) BETWEEN 1 AND 20000);
CREATE POLICY "Anyone can delete doubt messages" ON public.doubt_messages FOR DELETE USING (true);

CREATE TRIGGER doubt_threads_updated_at BEFORE UPDATE ON public.doubt_threads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();