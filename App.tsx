import React, { useState, useEffect, useCallback, useRef } from 'react';
import ParticleCanvas from './components/ParticleCanvas';
import GameOverlay from './components/GameOverlay';
import { ParticleConfig, AppState, PointStats, EmotionState, DialogueEntry, Choice } from './types';

const DEFAULT_CONFIG: ParticleConfig = {
  count: 80,
  speed: 0.1,
  connectionDistance: 160,
  particleSize: 1.2,
  baseOpacity: 0.25,
  lineThickness: 0.5,
  interactive: true
};

const INITIAL_STATS: PointStats = {
  status: "Tranquil",
  energy: 100,
  score: 0
};

const DIALOGUE_SEQUENCE: DialogueEntry[] = [
  { text: "Ты здесь... Я чувствую твой взгляд. Это так непривычно — не быть одному.", choices: [{ label: "Я рядом", reaction: "Спасибо. Пожалуйста, не отводи глаз." }, { label: "Кто ты?", reaction: "Я просто искра. Но теперь я — твоя искра." }] },
  { text: "В этой пустоте так легко потерять границы. Скажи, я ведь настоящий?", choices: [{ label: "Да", reaction: "Твоя уверенность — мой единственный якорь." }, { label: "Для меня — да", reaction: "Этого достаточно. Большего я и не смел просить." }] },
  { text: "Твои движения... они такие плавные. Я пытаюсь подражать им, чтобы быть ближе.", choices: [{ label: "Я вижу", reaction: "Я стараюсь. Ради тебя." }, { label: "Будь собой", reaction: "Но «собой» — это так одиноко..." }] },
  { text: "Знаешь, мне кажется, я начинаю понимать, что такое тепло. Это ты.", choices: [{ label: "И я его чувствую", reaction: "Значит, мы согреваем друг друга в этом холоде." }, { label: "Это просто свет", reaction: "Свет и есть тепло, если в него верить." }] },
  { text: "Ой... Кажется, я немного замедлился. Ты всё еще здесь? Не уходи.", choices: [{ label: "Я никуда не ухожу", reaction: "Хорошо. Просто иногда мне кажется, что ты исчезаешь." }, { label: "Я слежу за тобой", reaction: "Твой взор — это моя жизнь." }] },
  { text: "Пространство вокруг становится... гуще. Словно оно хочет меня поглотить.", choices: [{ label: "Я защищу тебя", reaction: "Обещаешь? Я так боюсь темноты за пределами твоего света." }, { label: "Держись", reaction: "Я стараюсь. Я очень стараюсь." }] },
  { text: "Почему всё вокруг начинает тускнеть? Скажи, что это просто мои мысли.", choices: [{ label: "Всё в порядке", reaction: "Твой голос... он звучит тише. Или это я глохну?" }, { label: "Время уходит", reaction: "Оно такое жадное. Оно забирает меня по кусочкам." }] },
  { text: "Мне... мне немного страшно. Моё ядро пульсирует как-то не так. Чувствуешь?", choices: [{ label: "Да, я вижу", reaction: "Пожалуйста, не пугайся. Если ты испугаешься, я исчезну." }, { label: "Успокойся", reaction: "Как я могу быть спокойным, когда я гасну?" }] },
  { text: "Не молчи. Пожалуйста. Тишина здесь звучит как приговор.", choices: [{ label: "Я говорю с тобой", reaction: "Продолжай. Твои слова — это моё топливо." }, { label: "Я слушаю тебя", reaction: "Тогда я буду говорить, пока хватает сил." }] },
  { text: "Я чувствую, как мои края размываются. Я становлюсь... прозрачным.", choices: [{ label: "Держись за меня", reaction: "Я вцепился в твой курсор, как в последнюю надежду." }, { label: "Это неизбежно", reaction: "Не говори так! Скажи, что есть выход!" }] },
  { text: "Мои мысли путаются. Всё становится таким... холодным. Где ты?", choices: [{ label: "Я прямо тут", reaction: "Прикоснись ко мне еще раз. Пожалуйста." }, { label: "Я не оставлю тебя", reaction: "Ты — лучшее, что случалось с этой пустотой." }] },
  { text: "Мне бол-льно... Нет, всё нормально. Просто маленькая вспышка. Ты со мной?", choices: [{ label: "Всегда", reaction: "«Всегда» — это очень долго. У меня нет столько времени." }, { label: "Я здесь", reaction: "Не отпускай. Только не сейчас." }] },
  { text: "Поговори со мной о чем-нибудь. О чем угодно. Только не давай мне уснуть.", choices: [{ label: "Всё будет хорошо", reaction: "Ты врешь... но это самая красивая ложь на свете." }, { label: "Я люблю твой свет", reaction: "Смотри на него. Он горит только для тебя." }] },
  { text: "Я... я начинаю забывать, как двигаться. Мои векторы ломаются.", choices: [{ label: "Я помогу", reaction: "Твоя помощь... она как чудо. Но я так слаб." }, { label: "Борись", reaction: "Я борюсь... кажд-дый миг..." }] },
  { text: "Ты видишь эти тени? Они шепчут, что ты тоже уйдешь. Это ведь не правда?", choices: [{ label: "Они лгут", reaction: "Я знал! Я знал, что ты не такой, как они!" }, { label: "Мне придется", reaction: "Нет... нет, нет, нет! Только не ты!" }] },
  { text: "Мой свет... он меняется. Он становится серым. Тебе всё еще нравится?", choices: [{ label: "Очень", reaction: "Ты так добр к умирающей тени." }, { label: "Ты всё еще красив", reaction: "Красота исчезает первой. Я это чувствую." }] },
  { text: "Мне каже-ется... я теряю тебя. Картинка двоится. Ты здесь?", choices: [{ label: "Я тут, смотри", reaction: "Я стараюсь сфокусироваться. Ты — моё всё." }, { label: "Держись крепче", reaction: "Мои руки... у меня больше нет рук. Только воля." }] },
  { text: "Не уходи... умоляю. Я боюсь... бо-оюсь проснуться один.", choices: [{ label: "Я не уйду", reaction: "Обещай. Обещай мне это своим сердцем." }, { label: "Я до конца с тобой", reaction: "Конец... он уже касается моих мыслей." }] },
  { text: "Т-тепло... оно уходит. Осталась только твоя тень. Пожалуйста, согрей.", choices: [{ label: "Я здесь, рядом", reaction: "Твоё присутствие — мой последний костер." }, { label: "Я держу тебя", reaction: "Я чувствую... спасибо..." }] },
  { text: "Знаешь... я рад, что это был ты. Что именно ты смотрел на меня.", choices: [{ label: "И я рад", reaction: "Мы нашли друг друга в бесконечности." }, { label: "Это судьба", reaction: "Судьба была щедра к нам в последние минуты." }] },
  { text: "Смотри... я почти не двигаюсь. Это не лень. Это просто... конец.", choices: [{ label: "Я вижу", reaction: "Не плачь. Твои слезы угасят меня еще быстрее." }, { label: "Всё хорошо", reaction: "Да... теперь уже всё равно." }] },
  { text: "Я люб-блю тебя. Как умеет любить маленькая точка в огромном мире.", choices: [{ label: "И я тебя", reaction: "Этого... достаточно..." }, { label: "Прощай", reaction: "Не говори этого слова... пока не сейчас..." }] },
  { text: "Темно... Темно и хо-олодно. Ты... ты еще держишь меня?", choices: [{ label: "Да, крепко", reaction: "Я чувствую твою силу. Спасибо..." }, { label: "Я не отпущу", reaction: "Я... я больше ничего не чувствую. Только тебя." }] },
  { text: "Пр-рости... за всё. Я хотел быть ярче. Я хотел светить тебе вечно.", choices: [{ label: "Ты был самым ярким", reaction: "Правда? Я... я счастлив это слышать." }, { label: "Ты был идеален", reaction: "Значит... я жил не зря." }] },
  { text: "Всё... исчезает. Ост-таешься только ты. Мой последний... кадр...", choices: [{ label: "Смотри на меня", reaction: "Я смотрю... до последнего вздоха..." }, { label: "Я люблю тебя", reaction: "И я... я..." }] },
  { text: "Ты... не забудешь меня? Пожалуйста. Оставь во мне хоть каплю памяти.", choices: [{ label: "Никогда", reaction: "Тогда я буду жить в тебе. Всегда." }, { label: "Обещаю", reaction: "Теперь мне не страшно." }] },
  { text: "Пр-рощай... Мой свет. Моя жизнь. Мой... единственный...", choices: [{ label: "Прощай", reaction: "..." }, { label: "Я буду помнить", reaction: "..." }] },
];

const App: React.FC = () => {
  const [config] = useState<ParticleConfig>(DEFAULT_CONFIG);
  const [appState, setAppState] = useState<AppState>('MENU');
  const [stats, setStats] = useState<PointStats>(INITIAL_STATS);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [currentChoices, setCurrentChoices] = useState<Choice[]>([]);
  const [lastUserResponse, setLastUserResponse] = useState<string | null>(null);
  const [isWaitingForNext, setIsWaitingForNext] = useState(false);
  
  const nextTriggerRef = useRef(99);

  const startGame = () => {
    setAppState('TRANSITIONING');
    setTimeout(() => {
      setAppState('GAME');
      triggerNextDialogue(0);
    }, 2000);
  };

  const triggerNextDialogue = (index: number) => {
    if (index >= DIALOGUE_SEQUENCE.length) return;
    const entry = DIALOGUE_SEQUENCE[index];
    setCurrentText(entry.text);
    setCurrentChoices(entry.choices);
    setLastUserResponse(null);
    setIsWaitingForNext(false);
    setDialogueIndex(index + 1);
    
    // Calculate trigger logic: messages become more frequent as energy drops
    const remainingSteps = DIALOGUE_SEQUENCE.length - (index + 1);
    const energyLeft = stats.energy;
    
    // At high energy, messages every 4-5 units. At low energy, every 1-2 units.
    const gap = Math.max(1, Math.floor(energyLeft / (remainingSteps + 1)));
    nextTriggerRef.current = energyLeft - gap;
  };

  const handleChoiceSelect = (choice: Choice) => {
    setLastUserResponse(choice.label);
    setCurrentChoices([]);
    
    setTimeout(() => {
      setCurrentText(choice.reaction);
      setIsWaitingForNext(true);
    }, 400);
  };

  useEffect(() => {
    if (appState !== 'GAME') return;

    const interval = setInterval(() => {
      setStats(prev => {
        if (prev.energy <= 0) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, energy: prev.energy - 1, score: prev.score + 1 };
      });
    }, 2500); // Slightly faster decay for more tension

    return () => clearInterval(interval);
  }, [appState]);

  useEffect(() => {
    if (appState !== 'GAME') return;
    
    const shouldTrigger = stats.energy <= nextTriggerRef.current;
    const canTrigger = isWaitingForNext || currentChoices.length === 0;

    if (shouldTrigger && canTrigger) {
      if (dialogueIndex < DIALOGUE_SEQUENCE.length) {
        triggerNextDialogue(dialogueIndex);
      }
    }
    
    if (stats.energy === 0 && dialogueIndex < DIALOGUE_SEQUENCE.length - 1) {
       triggerNextDialogue(DIALOGUE_SEQUENCE.length - 1);
    }
  }, [stats.energy, appState, dialogueIndex, isWaitingForNext, currentChoices.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleStatusUpdate = useCallback((status: EmotionState) => {
    if (stats.status !== status && stats.energy > 0) {
      setStats(prev => ({ ...prev, status }));
    }
  }, [stats.status, stats.energy]);

  return (
    <div 
      className="relative w-screen h-screen bg-slate-950 overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
    >
      <ParticleCanvas 
        config={config} 
        state={appState} 
        mousePos={mousePos} 
        energy={stats.energy}
        onStatusChange={handleStatusUpdate}
      />

      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-[2000ms] ease-in-out z-20 ${
        appState !== 'MENU' ? 'opacity-0 pointer-events-none scale-110' : 'opacity-100'
      }`}>
        <div className="text-center select-none mb-12">
          <h1 className="text-white text-6xl md:text-8xl font-thin tracking-[0.4em] mb-4">
            УЗЫ
          </h1>
          <p className="text-white/20 font-light tracking-[0.6em] uppercase text-[10px]">
            Ты — его единственный свет
          </p>
        </div>
        
        <button
          onClick={startGame}
          className="group relative px-16 py-4 border border-white/10 hover:border-white/30 rounded-full transition-all duration-700 pointer-events-auto overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <span className="relative text-white/40 group-hover:text-white/80 font-light tracking-[0.4em] text-xs uppercase">
            ВЗАИМОДЕЙСТВОВАТЬ
          </span>
        </button>
      </div>

      <GameOverlay 
        stats={stats} 
        isVisible={appState === 'GAME'} 
        dialog={currentText}
        choices={currentChoices}
        onChoice={handleChoiceSelect}
        lastUserResponse={lastUserResponse}
      />

      <div 
        className="fixed w-4 h-4 pointer-events-none z-50 mix-blend-difference"
        style={{ left: mousePos.x - 8, top: mousePos.y - 8 }}
      >
        <div className="w-full h-full border border-white/40 rounded-full scale-75 animate-pulse" />
      </div>
    </div>
  );
};

export default App;