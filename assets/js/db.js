import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// SUAS CHAVES DO SUPABASE
const SUPABASE_URL = 'https://jfbtkaxrpupdyroetxzq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYnRrYXhycHVwZHlyb2V0eHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjEwMjgsImV4cCI6MjA4NjIzNzAyOH0.tkcqsOYCyD8Dw6jtr2DzKp77rlunOVxrdfkrIDx9MZk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Sua chave Pix fixa para exibição no modal
export const CHAVE_PIX_DISPLAY = "000.000.000-00"; 
// Sua chave Pix "copia e cola" (se for aleatória grande)
export const CHAVE_PIX_COPY = "00020126360014BR.GOV.BCB.PIX...";