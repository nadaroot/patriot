import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Send, 
  Bot, 
  User, 
  Trash2, 
  MessageSquare, 
  Zap, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { askPatriotAI } from '../../services/deepseek';

const STORAGE_CHATS_KEY = 'mesto_pomnit_ai_chats_v2';

const DEFAULT_WELCOME_MSG = {
  role: 'assistant',
  content: 'Здравствуйте. Я — краеведческий искусственный интеллект проекта «Место помнит». Моя база содержит историко-градостроительные хроники, архивные описания и подтверждённые факты об архитектуре Минска. Задайте вопрос о любом объекте или событии.'
};

export const AiEthicsDemo = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'default-chat-1',
        title: 'Архивная справка Минска',
        createdAt: Date.now(),
        messages: [DEFAULT_WELCOME_MSG]
      }
    ];
  });

  const [activeChatId, setActiveChatId] = useState(() => chats[0]?.id || 'default-chat-1');
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatBottomRef = useRef(null);

  // Sync chats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(chats));
    } catch (e) {
      console.error('Error saving chats to storage:', e);
    }
  }, [chats]);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const messages = activeChat?.messages || [DEFAULT_WELCOME_MSG];

  const handleCreateNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: `Диалог ${chats.length + 1}`,
      createdAt: Date.now(),
      messages: [DEFAULT_WELCOME_MSG]
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setSidebarOpen(false);
  };

  const handleDeleteChat = (e, chatIdToDelete) => {
    e.stopPropagation();
    if (chats.length <= 1) {
      // Just reset the single chat
      setChats([
        {
          id: `chat-${Date.now()}`,
          title: 'Новый диалог',
          createdAt: Date.now(),
          messages: [DEFAULT_WELCOME_MSG]
        }
      ]);
      return;
    }
    const remaining = chats.filter((c) => c.id !== chatIdToDelete);
    setChats(remaining);
    if (activeChatId === chatIdToDelete) {
      setActiveChatId(remaining[0].id);
    }
  };

  const handleSend = async () => {
    if (!inputQuestion.trim() || isLoading) return;

    const userText = inputQuestion.trim();
    setInputQuestion('');

    const userMsg = { role: 'user', content: userText };
    const updatedMessages = [...messages, userMsg];

    // Determine chat title if it's the first question
    let newTitle = activeChat.title;
    if (messages.length <= 1) {
      newTitle = userText.slice(0, 32) + (userText.length > 32 ? '...' : '');
    }

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, title: newTitle, messages: updatedMessages, updatedAt: Date.now() }
          : c
      )
    );

    setIsLoading(true);

    try {
      const res = await askPatriotAI(userText, updatedMessages);
      const aiMsg = { role: 'assistant', content: res.content };

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: [...updatedMessages, aiMsg], updatedAt: Date.now() }
            : c
        )
      );
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: 'Временный сбой связи с ИИ-моделью. Пожалуйста, повторите запрос.'
      };
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: [...updatedMessages, errorMsg], updatedAt: Date.now() }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className={`max-w-5xl mx-auto space-y-4 transition-colors ${
      isDark ? 'text-neutral-100' : 'text-neutral-900'
    }`}>
      
      {/* Top Header Card */}
      <div className={`p-4 sm:p-6 rounded-3xl backdrop-blur-xl border shadow-xl flex items-center justify-between gap-3 transition-colors ${
        isDark 
          ? 'bg-black/60 border-neutral-800/60' 
          : 'bg-white/90 border-neutral-200'
      }`}>
        <div>
          <h2 className={`font-bold text-xl sm:text-2xl tracking-tight flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-neutral-900'
          }`}>
            <Sparkles className="w-5 h-5" />
            <span>ИИ-исследователь Минска</span>
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Исторические архивы, градостроительные хроники и консультации по утраченному наследию
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewChat}
            className={`px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
              isDark 
                ? 'bg-white hover:bg-neutral-200 text-black' 
                : 'bg-neutral-900 hover:bg-black text-white'
            }`}
            title="Создать новый чат"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Новый диалог</span>
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isDark 
                ? 'bg-neutral-900/60 border-neutral-800/70 text-neutral-300 hover:text-white' 
                : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-black hover:bg-neutral-200'
            }`}
            title="История диалогов"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">История ({chats.length})</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Saved Chats Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:col-span-1 space-y-2`}>
          <div className={`p-3.5 rounded-3xl backdrop-blur-xl border shadow-xl space-y-2 max-h-[580px] overflow-y-auto scrollbar-none transition-colors ${
            isDark 
              ? 'bg-black/60 border-neutral-800/60' 
              : 'bg-white/90 border-neutral-200'
          }`}>
            <div className={`flex items-center justify-between px-1 text-xs font-mono font-semibold mb-2 ${
              isDark ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              <span>Сохранённые чаты:</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                isDark ? 'bg-neutral-900 text-neutral-400' : 'bg-neutral-100 text-neutral-700'
              }`}>{chats.length}</span>
            </div>

            {chats.map((c) => {
              const isActive = c.id === activeChatId;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveChatId(c.id);
                    setSidebarOpen(false);
                  }}
                  className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer text-xs transition-all border ${
                    isActive
                      ? isDark 
                        ? 'bg-neutral-850/80 border-neutral-700/80 text-white font-medium shadow-md' 
                        : 'bg-neutral-200 border-neutral-300 text-neutral-900 font-semibold shadow-xs'
                      : isDark 
                        ? 'bg-neutral-950/40 border-neutral-850/50 text-neutral-400 hover:text-white hover:bg-neutral-900/50' 
                        : 'bg-neutral-50 border-neutral-200/80 text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
                    <span className="truncate">{c.title || 'Новый диалог'}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteChat(e, c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition-opacity"
                    title="Удалить диалог"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Terminal Main Box */}
        <div className={`flex flex-col rounded-3xl backdrop-blur-xl border shadow-2xl overflow-hidden h-[580px] transition-colors ${
          sidebarOpen ? 'hidden md:flex' : 'flex'
        } md:col-span-3 ${
          isDark 
            ? 'bg-black/60 border-neutral-800/60' 
            : 'bg-white/90 border-neutral-200'
        }`}>
          
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-md ${
                      isDark 
                        ? 'bg-neutral-900/80 border-neutral-800 text-white' 
                        : 'bg-neutral-100 border-neutral-300 text-black'
                    }`}>
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? isDark 
                          ? 'bg-white text-black font-medium shadow-md' 
                          : 'bg-neutral-900 text-white font-medium shadow-md'
                        : isDark 
                          ? 'bg-neutral-900/60 border border-neutral-800/70 text-neutral-200' 
                          : 'bg-neutral-50 border border-neutral-200/90 text-neutral-800 shadow-2xs'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {isUser && (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md font-bold text-xs ${
                      isDark 
                        ? 'bg-white text-black' 
                        : 'bg-neutral-900 text-white'
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className={`flex items-center gap-2 text-xs p-2 font-mono ${
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              }`}>
                <Zap className="w-4 h-4 animate-spin text-amber-400" />
                <span>ИИ формирует историческую выписку из архива...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Bar */}
          <div className={`p-3 border-t transition-colors ${
            isDark 
              ? 'border-neutral-800/60 bg-neutral-950/40' 
              : 'border-neutral-200 bg-neutral-50/70'
          }`}>
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
                placeholder="Задайте вопрос об историческом здании, улице или дате Минска..."
                className={`flex-1 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm focus:outline-none transition-all font-sans ${
                  isDark 
                    ? 'bg-neutral-900/60 border-neutral-800/70 text-white placeholder:text-neutral-500 focus:border-neutral-600' 
                    : 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 shadow-2xs'
                }`}
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading}
                className={`px-4 py-2.5 rounded-2xl disabled:opacity-40 font-semibold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0 ${
                  isDark 
                    ? 'bg-white hover:bg-neutral-200 text-black' 
                    : 'bg-neutral-900 hover:bg-black text-white'
                }`}
              >
                <span>Отправить</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
