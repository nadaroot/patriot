// Vercel Serverless Function: /api/chat
export const config = {
  runtime: 'nodejs',
};

const DEEPSEEK_HOSTS = [
  'http://100.71.166.18:9655',
  'http://46.53.228.211:9655',
  'http://127.0.0.1:9655'
];

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

  const { messages, model = 'deepseek-chat', customEndpoint } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const endpointsToTry = [];
  if (customEndpoint) {
    endpointsToTry.push(customEndpoint.replace(/\/$/, '') + '/chat/completions');
  }
  for (const host of DEEPSEEK_HOSTS) {
    endpointsToTry.push(`${host}/v1/chat/completions`);
  }

  for (const endpoint of endpointsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'deepseek-chat',
          messages,
          temperature: 0.6,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({
          ...data,
          _source: 'freedeepseek-live',
          _endpoint: endpoint
        });
      }
    } catch (err) {
      // Continue to next endpoint or fallback
    }
  }

  const userMsg = messages[messages.length - 1]?.content || '';
  const lower = userMsg.toLowerCase();

  let answer = 'Здравствуйте! Я ИИ-помощник проекта «Место помнит». Я бережно помогаю структурировать воспоминания, находить топонимы и связывать личные истории с архивными хрониками Минска. Чем могу помочь?';

  if (lower.includes('немиг')) {
    answer = 'На старой Немиге до сноса 1970-х годов сохранялась неповторимая атмосфера: узкая мостовая, двухэтажные кирпичные домики XIX века с арочными проездами, керосиновые лавки, булочные и трамвайные пути. Сама река Немига с 1926 года течет под землей в бетонном коллекторе. В 1970-е историческую застройку снесли ради прокладки широкой 8-полосной магистрали и строительства модернистского «дома-волны» архитектора Мусинского.';
  } else if (lower.includes('комар') || lower.includes('рынок') || lower.includes('купол')) {
    answer = 'Комаровка до середины XX века представляла собой болотистую окраину с деревянными мостками и стихийным крестьянским рынком с телегами. В 1980 году к Московской Олимпиаде был открыт уникальный вантовый крытый рынок по проекту архитекторов В. Аладова, А. Желдакова и конструктора М. Друкера. Его гигантский купол диаметром 103 метра не имеет ни одной центральной колонны и держится на гибких стальных канатах.';
  } else if (lower.includes('октябрьск') || lower.includes('сталин') || lower.includes('труб')) {
    answer = 'Октябрьская (бывшая Центральная) площадь была спланирована после войны. В сентябре 1952 года здесь открыли 10-метровый монумент И.В. Сталину. В ночь на 3 ноября 1961 года памятник был скрытно и быстро демонтирован военными за несколько часов. В 1980–90-е годы культовым местом минской молодежи стал подземный переход под площадью, прозванный «Трубой».';
  } else if (lower.includes('горько') || lower.includes('парк') || lower.includes('планетар')) {
    answer = 'Парк им. Максима Горького — один из старейших в Беларуси, основанный первым минским губернатором Захарием Корнеевым в 1805 году как Губернаторский сад. В 1960 году он стал Центральным детским парком. В 1965 году открылись знаменитый Планетарий и астрономическая обсерватория, а позже появилось 54-метровое колесо обозрения над рекой Свислочь.';
  } else if (lower.includes('улиц') || lower.includes('мзор') || lower.includes('мурал') || lower.includes('цех')) {
    answer = 'Улица Октябрьская (бывшая Нижне-Ляховская) на рубеже XIX–XX веков сформировалась как промышленное сердце города с заводом «Гигант» (впоследствии МЗОР) и дрожже-винокуренным заводом «Кристалл». В 2014–2019 годах благодаря фестивалю Vulica Brasil краснокирпичные заводские цеха превратились в одну из самых известных открытых арт-галерей Европы с монументальными муралами.';
  } else if (lower.includes('этик') || lower.includes('судья') || lower.includes('принцип')) {
    answer = 'Главный этический принцип проекта: «ИИ — помощник, не судья». Искусственный интеллект берет на себя рутину (расшифровка аудио, выделение топонимов и тем, поиск связей между соседними улицами, краткое резюме), но никогда не объявляет личное воспоминание истинным или ложным. Окончательное решение всегда остается за человеком — автором, модератором или краеведом.';
  }

  return res.status(200).json({
    id: `ds-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'deepseek-chat',
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
    usage: {
      prompt_tokens: userMsg.length,
      completion_tokens: answer.length,
      total_tokens: userMsg.length + answer.length
    },
    _source: 'freedeepseek-fallback'
  });
}
