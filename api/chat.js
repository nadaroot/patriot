// Vercel Serverless Function: /api/chat
export const config = {
  runtime: 'nodejs',
};

const AI_HOSTS = [
  'http://100.71.166.18:9655',
  'http://46.53.228.211:9655',
  'http://127.0.0.1:9655'
];

const SYSTEM_PROMPT = `Ты — «Патриот AI», собственная компактная нейросетевая модель историко-краеведческого проекта «Место помнит».
Ты создана специально для мгновенного анализа архивных документов, фотосвидетельств и градостроительной хроники Минска и Беларуси.
Ты никогда не упоминаешь сторонние компании или чужие названия; ты позиционируешь себя исключительно как «Патриот AI».
Отвечай максимально быстро, лаконично, точно по существу вопроса, без лишних вводных слов и воды.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, customEndpoint } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Inject system prompt ensuring Patriot AI identity
  const systemMsg = { role: 'system', content: SYSTEM_PROMPT };
  const fullMessages = [
    systemMsg,
    ...messages.filter(m => m.role !== 'system')
  ];

  const endpointsToTry = [];
  if (customEndpoint) {
    endpointsToTry.push(customEndpoint.replace(/\/$/, '') + '/chat/completions');
  }
  for (const host of AI_HOSTS) {
    endpointsToTry.push(`${host}/v1/chat/completions`);
  }

  for (const endpoint of endpointsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat', // Fastest non-thinking model
          messages: fullMessages,
          temperature: 0.3, // Low temp for fastest deterministic output
          max_tokens: 450,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({
          ...data,
          model: 'patriot-ai-fast',
          _source: 'patriot-ai-engine',
        });
      }
    } catch (err) {
      // Continue
    }
  }

  // Fast direct historical fallback
  const userMsg = messages[messages.length - 1]?.content || '';
  const lower = userMsg.toLowerCase();

  let answer = 'Патриот AI на связи. Задайте вопрос по любой локации Минска (Немига, Комаровка, Октябрьская площадь, Ратуша, Троицкое, Ворота Минска, Оперный театр).';

  if (lower.includes('немиг')) {
    answer = 'Немига: древнейшая улица Минска. В 1926 году река Немига заключена в подземный коллектор. В 1974 году историческая купеческая застройка XIX века снесена при расширении проспекта и строительстве «дома-волны» Мусинского.';
  } else if (lower.includes('комар') || lower.includes('рынок')) {
    answer = 'Комаровский рынок: построен в 1980 году к Олимпиаде на месте осушенного болота. Уникальный вантовый купол диаметром 103 метра перекрывает пространство без внутренних колонн (архитекторы Аладов, Желдаков, Друкер).';
  } else if (lower.includes('октябрьск') || lower.includes('сталин')) {
    answer = 'Октябрьская площадь: спланирована в 1950-х. 10-метровый памятник Сталину демонтирован в ночь на 3 ноября 1961 года. Дворец Республики возведен в 1985–2001 годах.';
  } else if (lower.includes('троицк')) {
    answer = 'Троицкое предместье: исторический район на Свислочи. Регулярная планировка после пожара 1809 года. В 1980–1987 гг. проведена образцовая научная регенерация старинного квартала.';
  } else if (lower.includes('ворот') || lower.includes('вокзал')) {
    answer = 'Ворота Минска: две симметричные 11-этажные башни 1953 года архитектора Б. Рубаненко на Привокзальной площади. На правой башне установлены трофейные часы диаметром 3.5 метра.';
  } else if (lower.includes('ратуш')) {
    answer = 'Минская ратуша: символ Магдебургского права (1499 г.). Снесена в 1857 году по указу Николая I. Заново воссоздана на оригинальном фундаменте в 2002–2004 годах по чертежам архитектора Ф. Крамера.';
  } else if (lower.includes('опер') || lower.includes('театр')) {
    answer = 'Большой театр Беларуси: шедевр советского конструктивизма зодчего Иосифа Лангбарда (1934–1938 гг.). Восстановлен после бомбардировок в 1947 году.';
  } else if (lower.includes('побед') || lower.includes('монумент')) {
    answer = 'Площадь Победы: 38-метровый обелиск открыт 4 июля 1954 года. Вечный огонь зажжен 3 июля 1961 года.';
  } else if (lower.includes('кто ты') || lower.includes('модел') || lower.includes('что за ии')) {
    answer = 'Я — «Патриот AI», специализированная нейросетевая модель проекта «Место помнит». Я обучена на архивных документах, планах застройки и хрониках Беларуси.';
  }

  return res.status(200).json({
    id: `patriot-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'patriot-ai-fast',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: answer
        },
        finish_reason: 'stop'
      }
    ],
    _source: 'patriot-ai-engine'
  });
}
