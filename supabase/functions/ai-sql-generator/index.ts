import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userQuestion, selectedModel } = await req.json();
    
    if (!userQuestion) {
      throw new Error('Требуется вопрос пользователя');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    const systemPrompt = `
    Ты генератор SQL запросов для PostgreSQL. Таблица: crm_analytics
    
    КЛЮЧЕВЫЕ ПОЛЯ:
    Служебные: id, call_id, call_datetime, uploaded_at, analyzed_at
    Метаданные: client_id, client_phone, user_id, user_name, department, brand, call_type, tag
    Аудио: file_name, file_url, file_status
    Критерии (boolean): greeting_correct, operator_said_name, cause_identified, cause_clarified, address_clarified, active_listening_done, answer_complete, operator_thanked, client_helped, conflict_resolved
    Оценки: compliance_score (1-5), conflict_risk_score (1-10), overall_score (1-10)
    Временные этапы: conversation_stage_greeting, conversation_stage_request, conversation_stage_solution, conversation_stage_closing, conversation_duration_total, conversation_duration_minutes
    Описательные: operator_tonality, burnout_level, burnout_signs (jsonb), conflict_moments, final_conclusion
    Транскрипция: transkription, transkription_full_json (jsonb)
    Вычисляемые: is_first_contact, stages_score, quality_score, call_success
    
    ЗНАЧЕНИЯ (на русском):
    - operator_tonality: 'Положительная', 'Нейтральная', 'Негативная', 'Профессиональная'
    - burnout_level: 'Не выявлено', 'Легкие признаки', 'Явные признаки'
    - call_success: 'Успешный', 'Средний результат', 'Неуспешный'
    - file_status: 'new', 'processing', 'completed', 'failed'
    - tag: может содержать 'new' для первичных обращений
    
    ПРАВИЛА:
    - Возвращай ТОЛЬКО валидный SQL без объяснений
    - Используй агрегации (COUNT, AVG, SUM, MAX, MIN)
    - Для дат используй DATE_TRUNC и фильтры по call_datetime
    - Булевые поля: true/false или IS NULL
    - Для текстового поиска используй ILIKE '%текст%'
    - Все значения данных на русском языке
    - Ограничивай результаты LIMIT 50 если не указано иначе
    - burnout_signs это jsonb массив, используй jsonb операторы для поиска
    `;

    let generatedSQL = '';

    if (selectedModel === 'openai') {
      if (!openaiApiKey) {
        throw new Error('OpenAI API ключ не настроен');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-5-2025-08-07',
          max_completion_tokens: 1000,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Вопрос на русском: ${userQuestion}` }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API ошибка: ${response.statusText}`);
      }

      const data = await response.json();
      generatedSQL = data.choices[0].message.content;
    } else if (selectedModel === 'gemini') {
      if (!geminiApiKey) {
        throw new Error('Gemini API ключ не настроен');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nВопрос на русском: ${userQuestion}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API ошибка: ${response.statusText}`);
      }

      const data = await response.json();
      generatedSQL = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Неподдерживаемая модель');
    }

    // Clean up SQL (remove code blocks if present)
    generatedSQL = generatedSQL.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Generated SQL:', generatedSQL);

    return new Response(JSON.stringify({ sql: generatedSQL }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Ошибка в ai-sql-generator function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});