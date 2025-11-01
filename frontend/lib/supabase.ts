import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our collectibles
export interface Collectible {
  id: number
  beezie_token_id: number
  name: string | null
  image_url: string | null
  beezie_price: number | null
  serial_number: string | null
  year: string | null
  grader: string | null
  grade: string | null
  player_name: string | null
  set_name: string | null
  card_number: string | null
  category: string | null
  language: string | null
  alt_asset_id: string | null
  alt_market_value: number | null
  created_at: string
  last_updated: string
}
