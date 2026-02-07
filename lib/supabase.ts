
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xrndjadulsgkthknasbg.supabase.co';
const supabaseAnonKey = 'sb_publishable_mkIy3_LtGrqFHeA-3I5XSw_nSAKCiEU'; 

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
