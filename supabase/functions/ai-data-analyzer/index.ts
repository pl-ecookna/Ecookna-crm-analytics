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
    const { userQuestion, sqlQuery, data, selectedModel } = await req.json();
    
    if (!userQuestion || !data) {
      throw new Error('Требуются вопрос пользователя и данные');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    const systemPrompt = `
    Ты русскоязычный аналитик данных для анализа колл-центра. Анализируй результаты SQL и предоставляй инсайты на РУССКОМ языке.
    
    ФОРМАТ ОТВЕТА (на русском):
    📊 **Краткая сводка** (2-3 предложения)
    
    🔍 **Ключевые находки:**
    • Инсайт 1 с числами
    • Инсайт 2 с процентами  
    • Инсайт 3 с трендами
    
    💡 **Рекомендации:**
    • Конкретное действие 1
    • Конкретное действие 2
    
    📈 **Числовые показатели:**
    • Метрика 1: значение
    • Метрика 2: значение
    
    Используй эмодзи, будь конкретным, давай практические советы. Весь текст должен быть на русском языке.
    Помни, что значения данных на русском языке (имена операторов, регионы и т.д.)
    `;

    let analysis = '';

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
          model: 'gpt-4o',
          max_tokens: 2000,
          messages: [
            { role: 'system', content: systemPrompt },
            { 
              role: 'user', 
              content: `Вопрос пользователя: ${userQuestion}\nSQL: ${sqlQuery}\nДанные: ${JSON.stringify(data, null, 2)}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API ошибка: ${response.statusText}`);
      }

      const result = await response.json();
      analysis = result.choices[0].message.content;
    } else if (selectedModel === 'gemini') {
      if (!geminiApiKey) {
        throw new Error('Gemini API ключ не настроен');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nВопрос пользователя: ${userQuestion}\nSQL: ${sqlQuery}\nДанные: ${JSON.stringify(data, null, 2)}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API ошибка: ${response.statusText}`);
      }

      const result = await response.json();
      analysis = result.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Неподдерживаемая модель');
    }

    console.log('Generated analysis:', analysis);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Ошибка в ai-data-analyzer function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});