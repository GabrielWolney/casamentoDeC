import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://jfbtkaxrpupdyroetxzq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYnRrYXhycHVwZHlyb2V0eHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjEwMjgsImV4cCI6MjA4NjIzNzAyOH0.tkcqsOYCyD8Dw6jtr2DzKp77rlunOVxrdfkrIDx9MZk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const CHAVE_PIX_NOIVOS = "07737349103"; 

export const NOME_NOIVOS = "CAMILA E DAVI"; 

export const CIDADE_NOIVOS = "BRASILIA";

export const CHAVE_PIX_DISPLAY = CHAVE_PIX_NOIVOS;