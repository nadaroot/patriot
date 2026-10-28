import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Mic, 
  MicOff, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Activity
} from 'lucide-react';
import { analyzeStoryWithAI } from '../../services/deepseek';

export const StoryWizard = ({
  isOpen,
  onClose,
  locations = [],
  preselectedLocation = null,
  onSaveStory,
  onPickCoordinateOnMap,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedLocationId, setSelectedLocationId] = useState(preselectedLocation?.id || '');
  const [customLocationName, setCustomLocationName] = useState('');
  const [focusQuestion, setFocusQuestion] = useState('Что раньше было на этом месте?');
  const [storyText, setStoryText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photoYear, setPhotoYear] = useState('1970-е');
  const [consentPublished, setConsentPublished] = useState(false);
  const [photoRightsConfirmed, setPhotoRightsConfirmed] = useState(false);

  // Speech Recognition
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // AI Assistant Analysis
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  useEffect(() => {
    if (preselectedLocation) {
      setSelectedLocationId(preselectedLocation.id);
    }
  }, [preselectedLocation]);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ru-RU';

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setStoryText((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
          }
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Голосовой ввод не поддерживается вашим браузером. Вы можете ввести текст вручную.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        setIsRecording(false);
      }
    }
  };

  const runAiProcessing = async () => {
    setIsAnalyzingAi(true);
    const loc = locations.find((l) => l.id === selectedLocationId)?.title || customLocationName || 'Минск';
    const auth = isAnonymous ? 'Анонимный очевидец' : (authorName || 'Житель Минска');

    try {
      const result = await analyzeStoryWithAI({
        text: storyText,
        locationTitle: loc,
        author: auth,
      });
      setAiAnalysis(result);
    } catch (e) {
      // Fallback
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedLocationId && !customLocationName) {
      alert('Пожалуйста, выберите место из списка или введите название');
      return;
    }
    if (currentStep === 3 && !storyText.trim()) {
      alert('Пожалуйста, введите текст воспоминания или надиктуйте его голосом');
      return;
    }
    if (currentStep === 4 && (!consentPublished || !photoRightsConfirmed)) {
      alert('Для публикации необходимо подтвердить согласие и права на материалы');
      return;
    }

    if (currentStep === 4) {
      runAiProcessing();
    }

    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = () => {
    const targetLoc = locations.find((l) => l.id === selectedLocationId);
    const locationName = targetLoc ? targetLoc.title : (customLocationName || 'Новое памятное место');

    const newVoice = {
      id: `voice-${Date.now()}`,
      author: isAnonymous ? 'Анонимный свидетель' : (authorName.trim() || 'Житель Минска'),
      isAnonymous,
      type: 'memory',
      topic: aiAnalysis?.topics?.[0] ? 'childhood' : 'changes',
      year: photoYear || 'Воспоминания',
      quote: aiAnalysis?.quote || `«${storyText.slice(0, 80).trim()}...»`,
      fullText: storyText,
      audioDuration: '1:15',
      source: `Добавлено на карту «Место помнит» (${new Date().toLocaleDateString('ru-RU')})`,
    };

    onSaveStory(selectedLocationId, locationName, newVoice);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        
        {/* Header: 5 Steps */}
        <div className="p-5 sm:p-6 border-b border-neutral-850 bg-neutral-900/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                Маршрут исследователя · Шаг {currentStep} из 5
              </span>
              <h3 className="font-bold text-lg sm:text-xl text-white mt-0.5">
                {currentStep === 1 && 'Шаг 1. Выбрать место на карте'}
                {currentStep === 2 && 'Шаг 2. Ответить на фокус-вопрос'}
                {currentStep === 3 && 'Шаг 3. Прикрепить материал'}
                {currentStep === 4 && 'Шаг 4. Подтвердить согласие'}
                {currentStep === 5 && 'Шаг 5. ИИ-помощник и публикация'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step <= currentStep ? 'bg-white' : 'bg-neutral-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 flex-1 text-neutral-300">
          
          {/* STEP 1: SELECT PLACE */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Укажите знаковое место Минска из текущего архива или введите памятный адрес.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200 block">
                  Выберите локацию из списка:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {locations.map((loc) => {
                    const isSelected = selectedLocationId === loc.id;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => {
                          setSelectedLocationId(loc.id);
                          setCustomLocationName('');
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-neutral-900 border-white text-white shadow-xs'
                            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-neutral-500'}`} />
                          <div>
                            <div className="text-xs sm:text-sm font-semibold">{loc.title}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">{loc.district}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-neutral-200 block mb-1">
                  Либо укажите свой адрес / памятный двор:
                </label>
                <input
                  type="text"
                  value={customLocationName}
                  onChange={(e) => {
                    setCustomLocationName(e.target.value);
                    setSelectedLocationId('');
                  }}
                  placeholder="Например: Двор на ул. Карла Маркса или сквер у Троицкого"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-neutral-600 text-white placeholder:text-neutral-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: FOCUS QUESTION */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Наводящие фокус-вопросы помогают вспомнить важные детали повседневной жизни:
              </p>

              <div className="space-y-2.5">
                {[
                  'Что раньше было на этом месте?',
                  'Что здесь изменилось на вашей памяти?',
                  'Каким вам запомнился этот двор или улица в детстве?',
                  'Где собирались соседи и о чем тогда говорили?',
                ].map((q) => {
                  const isSelected = focusQuestion === q;
                  return (
                    <div
                      key={q}
                      onClick={() => setFocusQuestion(q)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-neutral-900 border-white text-white'
                          : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-neutral-500'}`} />
                        <span className="text-xs sm:text-sm font-medium">{q}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-850 text-xs text-neutral-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-neutral-300 shrink-0 mt-0.5" />
                <span>
                  <strong>Совет архивиста:</strong> гораздо ценнее звуки, запахи, эмоции и привычки очевидцев, чем официальные сухие даты.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: MATERIAL & VOICE RECORD */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-200 block">
                  Рассказ очевидца или свидетельство:
                </label>
                
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                    isRecording
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-200 border border-neutral-800'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-white" />}
                  <span>{isRecording ? 'Запись идет... Стоп' : 'Диктовать голосом'}</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="Напишите историю своими словами или запишите устный рассказ... Например: «Помню, в 70-е на этом углу стояла тележка с газировкой за 3 копейки...»"
                className="w-full p-3.5 rounded-xl text-xs sm:text-sm bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-neutral-600 text-white leading-relaxed placeholder:text-neutral-600"
              />

              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                  Примерный период воспоминания:
                </label>
                <input
                  type="text"
                  value={photoYear}
                  onChange={(e) => setPhotoYear(e.target.value)}
                  placeholder="Например: 1968 г. или 1980-е"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-neutral-600 text-white"
                />
              </div>
            </div>
          )}

          {/* STEP 4: CONSENT & ETHICS */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Публикация возможна только с согласия автора, с проверкой прав на снимки и возможностью анонимности.
              </p>

              <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <label className="text-xs font-semibold text-neutral-200 block">
                  Как подписать свидетельство в архиве:
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="anon"
                      checked={!isAnonymous}
                      onChange={() => setIsAnonymous(false)}
                      className="text-white"
                    />
                    <span>Указать имя автора</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="anon"
                      checked={isAnonymous}
                      onChange={() => setIsAnonymous(true)}
                      className="text-white"
                    />
                    <span>Остаться анонимным свидетелем</span>
                  </label>
                </div>

                {!isAnonymous && (
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ваше имя или имя очевидца (например: Анна Сергеевна, 64 года)"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black border border-neutral-700 text-white focus:outline-none focus:border-neutral-500"
                  />
                )}
              </div>

              {/* Consent checkboxes */}
              <div className="space-y-2.5 pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={consentPublished}
                    onChange={(e) => setConsentPublished(e.target.checked)}
                    className="mt-0.5 rounded text-white"
                  />
                  <span>
                    Я подтверждаю согласие на размещение этих воспоминаний в некоммерческом архиве «Место помнит».
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={photoRightsConfirmed}
                    onChange={(e) => setPhotoRightsConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-white"
                  />
                  <span>
                    Подтверждаю, что сведения являются личным воспоминанием или переданы с согласия рассказчика.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: AI PROCESSING & PREVIEW */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Обработка FreeDeepSeek («ИИ — помощник, не судья»)</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    100.71.166.18:9655
                  </span>
                </div>

                {isAnalyzingAi ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-neutral-400 font-mono animate-pulse">
                    <Activity className="w-5 h-5 animate-spin text-white" />
                    <span>FreeDeepSeek выделяет темы и находит исторические связи...</span>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-3 pt-2 border-t border-neutral-800 text-xs">
                    <div>
                      <span className="text-neutral-400 block mb-1">Выделенные ключевые темы:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiAnalysis.topics?.map((t, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-full text-[11px] bg-neutral-800 border border-neutral-700 text-white font-medium">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-neutral-400 block mb-0.5">Краткая объективная справка:</span>
                      <p className="text-neutral-300 italic bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                        {aiAnalysis.summary}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/60 border border-neutral-800 text-[11px] text-neutral-400 font-mono flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{aiAnalysis.ethicsNote || 'Личное воспоминание очевидца. Авторство защищено.'}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Preview */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold block">
                  Предпросмотр в архиве:
                </span>
                <div className="font-semibold text-sm text-white">
                  {isAnonymous ? 'Анонимный свидетель' : (authorName || 'Житель Минска')} · {photoYear}
                </div>
                <blockquote className="text-xs italic text-neutral-300 pl-3 border-l-2 border-neutral-600">
                  «{storyText}»
                </blockquote>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-850 bg-neutral-900/60 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handlePrevStep}
              className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              onClick={handleNextStep}
              className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>Далее: Шаг {currentStep + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold shadow-xl flex items-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Опубликовать в архив Минска</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
