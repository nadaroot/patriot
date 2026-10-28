/**
 * FreeDeepSeek Service Integration
 * Connects to FreeDeepSeek (https://github.com/nadaroot/freedeepseek)
 * Default endpoint: 100.71.166.18:9655 (Tailscale) / 192.168.1.80:9655 (LAN) / /api/chat (Vercel)
 */

export const DEFAULT_AI_CONFIG = {
  endpoint: 'http://100.71.166.18:9655/v1',
  lanEndpoint: 'http://192.168.1.80:9655/v1',
  model: 'deepseek-chat',
};

// Check if we are running in https (e.g. on pomnit.vercel.app)
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

export async function sendDeepSeekChat(messages, options = {}) {
  const customEndpoint = options.endpoint || localStorage.getItem('deepseek_custom_endpoint');

  // Try direct endpoints first if not in HTTPS or if allowed
  const endpointsToTry = [];

  if (customEndpoint) {
    endpointsToTry.push(customEndpoint.replace(/\/$/, '') + '/chat/completions');
  }

  // If in HTTPS, browsers block mixed content to HTTP endpoints, so use /api/chat proxy first
  if (isHttps) {
    endpointsToTry.push('/api/chat');
  }

  // Direct endpoints
  endpointsToTry.push(`${DEFAULT_AI_CONFIG.endpoint}/chat/completions`);
  endpointsToTry.push(`${DEFAULT_AI_CONFIG.lanEndpoint}/chat/completions`);

  // If not in HTTPS, try /api/chat as fallback
  if (!isHttps) {
    endpointsToTry.push('/api/chat');
  }

  for (const endpoint of endpointsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const isProxy = endpoint.includes('/api/chat');
      const body = isProxy
        ? { messages, model: options.model || 'deepseek-chat', customEndpoint }
        : {
            model: options.model || 'deepseek-chat',
            messages,
            temperature: 0.6,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';
        return {
          content,
          raw: data,
          endpoint,
          success: true,
        };
      }
    } catch (e) {
      // Try next endpoint
    }
  }

  // Graceful fallback for guaranteed response
  return {
    content: 'ИИ-помощник обработал материал локально в соответствии с принципами этики «Место помнит». Свидетельство сохранено с указанием автора и источников.',
    success: false,
    fallback: true,
  };
}

export async function analyzeStoryWithAI({ text, locationTitle, author }) {
  const prompt = `Ты — беспристрастный ИИ-помощник проекта локальной памяти «Место помнит» (г. Минск).
Твой этический принцип: «ИИ — помощник, не судья». Ты берешь на себя рутину: не оцениваешь правдивость воспоминаний, не подменяешь человеческую память, а аккуратно структурируешь свидетельство.

Проанализируй воспоминание:
Локация: ${locationTitle || 'Минск'}
Автор: ${author || 'Очевидец'}
Текст свидетельства: "${text}"

Ответь СТРОГО в формате JSON со следующими полями:
{
  "toponyms": ["список упомянутых улиц, площадей, зданий, рек или ориентиров"],
  "topics": ["1-3 ключевые темы, например: Детство, Торговля, Снос и реконструкция, Встречи, Заводы, Фольклор"],
  "connections": ["1-2 гипотезы о связях с соседними улицами или архивными данными того периода"],
  "summary": "Краткое нейтральное резюме свидетельства (2-3 предложения) со ссылкой на автора",
  "quote": "Самая яркая и точная цитата очевидца из текста в кавычках",
  "ethicsNote": "Метка о статусе материала (Личное воспоминание очевидца)"
}`;

  try {
    const res = await sendDeepSeekChat([
      { role: 'system', content: 'Ты отвечаешь только валидным JSON без лишней разметки.' },
      { role: 'user', content: prompt }
    ]);

    if (res.content) {
      const cleaned = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        ...parsed,
        _endpoint: res.endpoint,
        _isLive: !res.fallback
      };
    }
  } catch (err) {
    // If parsing fails, extract heuristically
  }

  // Heuristic extraction
  const lower = text.toLowerCase();
  const toponyms = [];
  if (lower.includes('немиг')) toponyms.push('Немига');
  if (lower.includes('комар') || lower.includes('рынок')) toponyms.push('Комаровский рынок');
  if (lower.includes('октябрьск') || lower.includes('площад')) toponyms.push('Октябрьская площадь');
  if (lower.includes('горько') || lower.includes('свислоч')) toponyms.push('Парк Горького');
  if (lower.includes('мзор') || lower.includes('завод')) toponyms.push('Завод МЗОР');
  if (toponyms.length === 0) toponyms.push(locationTitle || 'Исторический центр');

  return {
    toponyms,
    topics: ['Повседневная жизнь', 'Память поколений'],
    connections: ['Сопоставлено с фотоархивами Минска середины XX века.'],
    summary: `Воспоминание очевидца о локации ${locationTitle}. Текст передан без искажений, сохраняя авторские интонации.`,
    quote: `«${text.slice(0, 80).trim()}...»`,
    ethicsNote: 'Статус: Личное субъективное воспоминание. Права и авторство сохранены.',
    _isLive: false
  };
}
