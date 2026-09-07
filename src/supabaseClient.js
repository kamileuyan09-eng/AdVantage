import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ayxyqlwmzudilifuplay.supabase.co'
const supabaseAnonKey = 'sb_publishable_o3oMxPowygPSbRq5XkRntg_2TSVP4he'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
