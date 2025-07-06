
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mxxtvtwcoplfajvazpav.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eHR2dHdjb3BsZmFqdmF6cGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDU2NjgsImV4cCI6MjA2NjE4MTY2OH0.b9sNxeDALujnw2tQD-qnbs3YkZvvTkja8jG6clgpibA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
