

## План актуализации AI API

### Проблемы в текущем коде:

1. **OpenAI**: Использует модель `gpt-4o` (строки 71 и 62 в обоих файлах)
   - Нужно обновить на `gpt-5-2025-08-07`
   - Для GPT-5 нужно использовать `max_completion_tokens` вместо `max_tokens`
   - GPT-5 не поддерживает параметр `temperature`

2. **Gemini**: Использует устаревший endpoint `/v1beta/models/gemini-pro:generateContent` (строки 91 и 85)
   - Актуальный endpoint: `/v1/models/gemini-2.0-flash-exp:generateContent`
   - Переход с v1beta на v1
   - Переход с gemini-pro на gemini-2.0-flash-exp

### Изменения:

#### 1. **supabase/functions/ai-sql-generator/index.ts**

**Строка 71** - изменить модель OpenAI:
```typescript
// Было:
model: 'gpt-4o',
max_tokens: 1000,

// Станет:
model: 'gpt-5-2025-08-07',
max_completion_tokens: 1000,
```

**Строка 91** - актуализировать Gemini endpoint:
```typescript
// Было:
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {

// Станет:
const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
```

#### 2. **supabase/functions/ai-data-analyzer/index.ts**

**Строка 62** - изменить модель OpenAI:
```typescript
// Было:
model: 'gpt-4o',
max_tokens: 2000,

// Станет:
model: 'gpt-5-2025-08-07',
max_completion_tokens: 2000,
```

**Строка 85** - актуализировать Gemini endpoint:
```typescript
// Было:
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {

// Станет:
const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
```

### Итого изменений:
- **2 файла** edge функций
- **4 строки кода** всего (по 2 в каждом файле)
- OpenAI: `gpt-4o` → `gpt-5-2025-08-07` + `max_tokens` → `max_completion_tokens`
- Gemini: `/v1beta/models/gemini-pro` → `/v1/models/gemini-2.0-flash-exp`

### Ожидаемый результат:
✅ AI аналитика заработает с актуальными моделями  
✅ Gemini перестанет возвращать "Not Found"  
✅ OpenAI будет использовать новейшую модель GPT-5  
✅ Все существующие API ключи останутся рабочими

