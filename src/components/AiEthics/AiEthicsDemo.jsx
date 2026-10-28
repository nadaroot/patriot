import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, RotateCcw, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { askPatriotAI } from '../../services/deepseek';

export const AiEthicsDemo = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Здравствуйте. Я — «Патриот AI», специализированная нейросетевая модель проекта «Место помнит». Моя база содержит архивные хроники, градостроительные чертежи и исторические свидетельства Минска. Задайте вопрос о любом месте города.'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const quickPrompts = [
    'Что раньше находилось на Немиге до 1970-х годов?',
    'Как строился вантовый купол Комаровского рынка?',
    'История сноса и восстановления Минской ратуши',
    'Когда и как демонтировали монумент на Октябрьской площади?',
    'Кто спроектировал башни Ворот Минска на вокзале?'
  ];

  const handleSend = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : inputQuestion;
    if (!query.trim() || isLoading) return;

    const userMsg = query.trim();
    setInputQuestion('');

    const newHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await askPatriotAI(userMsg, newHistory);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.content }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ошибка связи с локальным сервером Патриот AI.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-neutral-100">
      
      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-850 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Патриот AI · Версия 2.0 Fast</span>
          </div>
          <h2 className="font-bold text-2xl text-white tracking-tight">
            ИИ-исследователь архивных данных
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Специализированная скоростная нейросеть для мгновенной справки по истории, архитектуре и градостроительным изменениям.
          </p>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850 self-start sm:self-auto transition-colors"
          title="Очистить диалог"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider shrink-0">Запросы:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-850 text-neutral-300 hover:text-white hover:border-neutral-700 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Terminal Box */}
      <div className="h-[480px] overflow-y-auto space-y-3.5 p-5 rounded-3xl bg-neutral-950 border border-neutral-850 shadow-2xl">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-white text-black font-medium'
                    : 'bg-neutral-900/80 border border-neutral-800 text-neutral-200'
                }`}
              >
                {msg.content}
              </div>
              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shrink-0 shadow-md font-bold text-xs">
                  <User className="w-4 h-4 text-black" />
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 p-2 font-mono">
            <Zap className="w-4 h-4 animate-spin text-white" />
            <span>Патриот AI формирует архивную выписку...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Спросите об историческом здании, улице или дате..."
          className="flex-1 px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all font-sans"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isLoading}
          className="px-5 py-3 rounded-2xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-semibold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
        >
          <span>Запрос</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
