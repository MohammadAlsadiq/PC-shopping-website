
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Replace these with your Supabase project values
const SUPABASE_URL = "https://nkgbcrifxcaeicsjyuma.supabase.co";
const SUPABASE_KEY = "sb_publishable_bUFl0pGVxYy2HQ9JaKdhMg_oW8gAaKU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);