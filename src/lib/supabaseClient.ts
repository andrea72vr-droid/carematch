import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Client Supabase configurato per Next.js (gestisce automaticamente i cookie di sessione)
export const supabaseBrowserClient = () => {
  return createClientComponentClient();
};

