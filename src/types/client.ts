export interface Client {
  id: string; // Corresponde ao user_id do Supabase Auth
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
