import { createClient as _c } from '@supabase/supabase-js';

const _0xU = import.meta.env.VITE_SUPABASE_URL;
const _0xK = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
export const supabase = _c(_0xU, _0xK);

export const INDEXNOW_KEY = import.meta.env.VITE_INDEXNOW_KEY ?? null;