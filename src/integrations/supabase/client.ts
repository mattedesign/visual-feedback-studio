
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mxxtvtwcoplfajvazpav.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eHR2dHdjb3BsZmFqdmF6cGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0Nzg3NjEsImV4cCI6MjA0NjA1NDc2MX0.tqSuqH7k1g7JBD8gCYEvpF84gBiW0w4mJr79jqLyiuM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
