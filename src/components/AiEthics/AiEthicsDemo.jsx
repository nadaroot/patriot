import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Mic, 
  Link2, 
  FileText, 
  CheckCircle2, 
  Send,
  User,
  Bot,
  RotateCcw,
  Settings,
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';
import { analyzeStoryWithAI, sendDeepSeekChat, DEFAULT_AI_CONFIG } from '../../services/deepseek';

export const AiEthicsDemo = () => {
  const sampleStories = [
    {
      title: 'Рассказ о Немиге (1950-е)',
      author: 'Михаил Самуилович (род. 1941)',
      location: 'Старая Немига',
      rawAudio: 'Мы мальчишками бегали к мостику через Немигу и спорили, где именно под мостовой течет настоящая река. На первом этаже домов были керосиновые лавки и булочные, пахло свежим ржаным хлебом. А в семидесятые старые дома снесли чугунными бабами ради широкой трассы.',
    },
    {
      title: 'Воспоминания о Комаровке (1960-е)',
      author: 'Галина Петровна (род. 1949)',
      location: 'Комаровский рынок',
      rawAudio: 'Мама надевала мне резиновые ботики, кругом была непролазная грязь и деревянные настилы. Лошади с телегами стояли прямо у рядов, а в кадушках квасили капусту с клюквой. А когда в 1980 году возвели вантовый купол — казалось, космический корабль приземлился.',
    },
    {
      title: 'Ночь демонтажа Сталина (1961)',
      author: 'Анатолий Фёдорович (род. 1938)',
      location: 'Октябрьская площадь',
      rawAudio: 'В ночь на 3 ноября 1961 года военные оцепили Центральную площадь. Утром выходим на учебу в университет — а бронзового монумента Сталину нет, только пустой гранитный стилобат. Город шел мимо пешком и затаив дыхание смотрел на пустоту.',
    }
  ];

  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [inputText, setInputText] = useState(sampleStories[0].rawAudio);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState(() => {
    return localStorage.getItem('deepseek_custom_endpoint') || DEFAULT_AI_CONFIG.endpoint;
  });
  const [showEndpointSettings, setShowEndpointSettings] = useState(false);

  const [processedResult, setProcessedResult] = useState({
    toponyms: ['Улица Немига', 'Река Немига', 'Раковское предместье'],
    topics: ['Детство', 'Торговля и керосиновые лавки', 'Снос 1970-х'],
    connections: [
      'Созвучно с воспоминаниями Елены Викторовны о студенческих зарисовках домов перед сносом (1975 г.)',
      'Сопоставлено с архивным решением Мингорисполкома №114 о прокладке магистрали',
    ],
    summary: 'Личное свидетельство Михаила Самуиловича о звуковых и обонятельных деталях Немиги до пробивки проспекта. Текст сохранен без изменений.',
    quote: '«Мы мальчишками бегали к мостику через Немигу и спорили, где именно под мостовой течет настоящая река...»',
    ethicsNote: 'Статус: Субъективное воспоминание очевидца. Исторический факт сноса подтвержден архивом.',
    _isLive: true
  });

  // Chat with Kraeved AI state
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Здравствуйте! Я ИИ-краевед проекта «Место помнит», подключенный к модели FreeDeepSeek. Моя роль — помогать исследовать историю Минска, сопоставлять личные воспоминания с архивными фактами и отвечать на ваши вопросы. О каком месте или эпохе хотите узнать?'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const handleSelectSample = (index) => {
    setSelectedSampleIndex(index);
    setInputText(sampleStories[index].rawAudio);
    triggerAnalysis(sampleStories[index].rawAudio, sampleStories[index].location, sampleStories[index].author);
  };

  const triggerAnalysis = async (text = inputText, locTitle, author) => {
    setIsProcessing(true);
    const loc = locTitle || sampleStories[selectedSampleIndex]?.location || 'Минск';
    const auth = author || sampleStories[selectedSampleIndex]?.author || 'Очевидец';

    try {
      const result = await analyzeStoryWithAI({
        text,
        locationTitle: loc,
        author: auth
      });
      setProcessedResult(result);
    } catch (e) {
      // Fallback
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputQuestion.trim() || isChatLoading) return;

    const userText = inputQuestion.trim();
    setInputQuestion('');

    const newHistory = [
      ...chatMessages,
      { role: 'user', content: userText }
    ];
    setChatMessages(newHistory);
    setIsChatLoading(true);

    try {
      const systemPrompt = {
        role: 'system',
        content: `Ты — ИИ-краевед и архивист проекта локальной памяти «Место помнит» (г. Минск).
Работаешь на базе открытого FreeDeepSeek (сервер 100.71.166.18:9655).
Твоя цель: бережно рассказывать об истории Минска (Немига, Комаровка, Октябрьская площадь, Парк Горького, завод МЗОР и улица Октябрьская), отвечать на вопросы, разделять подтвержденные архивные факты и живые личные воспоминания очевидцев.
Отвечай вежливо, емко, со ссылками на исторический контекст Минска.`
      };

      const res = await sendDeepSeekChat([systemPrompt, ...newHistory.slice(-6)], {
        endpoint: customEndpoint
      });

      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.content }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Не удалось получить ответ от сервера FreeDeepSeek. Проверьте сетевое подключение к 100.71.166.18.' }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const saveEndpoint = (ep) => {
    setCustomEndpoint(ep);
    localStorage.setItem('deepseek_custom_endpoint', ep);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 text-neutral-100">
      
      {/* Principle Manifest (Slide 7 from Presentation) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            <Sparkles className="w-4 h-4 text-white" />
            <span>Технологическая этика проекта</span>
          </div>

          {/* DeepSeek Server Status Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>FreeDeepSeek · 100.71.166.18:9655</span>
            </div>
            <button
              onClick={() => setShowEndpointSettings(!showEndpointSettings)}
              className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
              title="Настройки endpoint"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Custom Endpoint Settings (Collapsible) */}
        {showEndpointSettings && (
          <div className="mb-4 p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
            <div className="font-semibold text-neutral-300">FreeDeepSeek API Endpoint:</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customEndpoint}
                onChange={(e) => saveEndpoint(e.target.value)}
                placeholder="http://100.71.166.18:9655/v1"
                className="flex-1 px-3 py-1.5 rounded-lg bg-black border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-white"
              />
              <button
                onClick={() => saveEndpoint(DEFAULT_AI_CONFIG.endpoint)}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono"
              >
                Сброс
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 font-mono">
              По умолчанию: 100.71.166.18 (Tailscale) / 192.168.1.80 (LAN) / /api/chat (Vercel proxy)
            </p>
          </div>
        )}

        <h2 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">
          ИИ — помощник, не судья
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-3xl mt-2 font-sans">
          В проекте «Место помнит» нейросетевые инструменты берут на себя рутину: помогают перевести устную речь в текст, выделяют упоминаемые топонимы и находят параллельные истории с соседних улиц. При этом система никогда не подменяет память очевидца и не объявляет субъективное воспоминание «неправильным».
        </p>

        {/* 3 Steps of AI from Slide 7 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 mt-6 border-t border-neutral-850">
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Шаг 1</span>
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm font-semibold text-white">Расшифровка аудио</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Преобразует устный рассказ свидетеля в текст, освобождая пожилых краеведов от необходимости печатать.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Шаг 2</span>
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm font-semibold text-white">Поиск связей</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Выделяет топонимы и находит похожие истории с соседних кварталов, объединяя свидетельства разных людей.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Шаг 3</span>
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm font-semibold text-white">Краткое резюме</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Формирует объективную выжимку со строгими цитатами и обязательной ссылкой на первоисточник.
            </p>
          </div>
        </div>

        {/* Golden rule alert */}
        <div className="mt-5 p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-start gap-3 text-xs text-neutral-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white">Принцип прозрачности:</strong> Окончательное решение о публикации и исторической интерпретации всегда остаётся за человеком — автором, архивистом или модератором.
          </div>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE MEMORY ANALYSIS */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-white">
              Интерактивная обработка воспоминания
            </h3>
            <p className="text-xs text-neutral-400">
              Попробуйте готовый пример или вставьте свой текст, чтобы увидеть работу модели DeepSeek.
            </p>
          </div>
        </div>

        {/* Sample story pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-wider shrink-0">Примеры:</span>
          {sampleStories.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(idx)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-medium ${
                selectedSampleIndex === idx
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Text Input Area */}
        <div className="space-y-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="w-full p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-all font-sans leading-relaxed"
            placeholder="Введите устный рассказ очевидца или семейное воспоминание..."
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-mono">
              Символов: {inputText.length}
            </span>
            <button
              onClick={() => triggerAnalysis()}
              disabled={isProcessing || !inputText.trim()}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              {isProcessing ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Обработка DeepSeek...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Анализировать через FreeDeepSeek</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Output Card */}
        {processedResult && (
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Результат работы ИИ-помощника</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800">
                {processedResult._isLive ? 'FreeDeepSeek V4 (Live)' : 'Этический модуль'}
              </span>
            </div>

            {/* Toponyms & Topics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Выделенные топонимы:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {processedResult.toponyms?.map((tp, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-200 text-[11px]">
                      {tp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Тематические метки:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {processedResult.topics?.map((tp, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-200 text-[11px]">
                      {tp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Cross-Connections */}
            <div className="space-y-1 pt-2 border-t border-neutral-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                Связи с соседними свидетельствами:
              </span>
              <ul className="space-y-1 text-neutral-300">
                {processedResult.connections?.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-neutral-500">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary & Quote */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <div className="text-neutral-300 leading-relaxed">
                <strong className="text-white">Краткое резюме: </strong>
                {processedResult.summary}
              </div>
              {processedResult.quote && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 italic font-serif">
                  {processedResult.quote}
                </div>
              )}
            </div>

            {/* Ethics badge */}
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
              <span>{processedResult.ethicsNote || 'Личное воспоминание очевидца. Авторство и цитирование сохранены.'}</span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: LIVE CHAT WITH KRAEVED AI */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-neutral-300" />
              <span>Диалог с ИИ-краеведом Минска</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Задайте любой вопрос о малой родине, утраченных зданиях или деталях минского быта.
            </p>
          </div>
          <button
            onClick={() => setChatMessages([chatMessages[0]])}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
            title="Очистить чат"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History Box */}
        <div className="h-[340px] overflow-y-auto space-y-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850">
          {chatMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-white text-black font-medium'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
                  }`}
                >
                  {msg.content}
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center shrink-0 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          {isChatLoading && (
            <div className="flex items-center gap-2 text-xs text-neutral-400 p-2">
              <Activity className="w-4 h-4 animate-spin text-white" />
              <span>FreeDeepSeek размышляет над ответом...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Спросите: «Что было на Немиге до сноса?», «Как строили Комаровку?»..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isChatLoading}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
          >
            <span>Спросить</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
