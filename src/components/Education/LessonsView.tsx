import React, { useState } from 'react';
import { BookOpen, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { LESSONS, QuizOption } from '../../data/lessons';
import { useExecutionStore } from '../../store/executionStore';
import confetti from 'canvas-confetti';

export const LessonsView: React.FC = () => {
  const { selectedLessonId, setSelectedLessonId } = useExecutionStore();
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);

  const activeLesson = LESSONS.find((l) => l.id === selectedLessonId) || LESSONS[0];

  const handleSelectLesson = (id: string) => {
    setSelectedLessonId(id);
    setSelectedOption(null);
    setHasAnswered(false);
  };

  const handleAnswer = (option: QuizOption) => {
    setSelectedOption(option);
    setHasAnswered(true);
    if (option.isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-4 font-sans">
      {/* Header & Lesson Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0E0E0] pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#2874F0]" />
          <div>
            <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
              Interactive Computer Science Lessons
            </h2>
            <span className="text-[10px] text-[#666666] font-mono">
              Step-by-step guided architectural walkthroughs & knowledge checks
            </span>
          </div>
        </div>

        {/* Lesson Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {LESSONS.map((l) => (
            <button
              key={l.id}
              onClick={() => handleSelectLesson(l.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                selectedLessonId === l.id
                  ? 'bg-[#2874F0] text-white font-bold shadow-xs'
                  : 'text-[#666666] hover:text-[#212121] bg-[#FAFAFA] border border-[#E0E0E0]'
              }`}
            >
              {l.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Header Card */}
      <div className="p-3.5 rounded-xl bg-[#E8F0FE] border border-[#2874F0]/30">
        <h3 className="text-sm font-bold text-[#2874F0]">{activeLesson.title}</h3>
        <p className="text-xs text-[#666666] mt-0.5">{activeLesson.subtitle}</p>
      </div>

      {/* Lesson Steps Sequence */}
      <div className="space-y-2.5">
        {activeLesson.steps.map((step, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E0E0E0] flex flex-col sm:flex-row sm:items-start justify-between gap-3 font-mono text-xs shadow-xs"
          >
            <div className="space-y-1 sm:max-w-[65%]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#2874F0] text-white flex items-center justify-center font-bold text-[10px]">
                  {idx + 1}
                </span>
                <span className="font-bold text-[#212121] font-sans text-xs">{step.title}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E8F0FE] text-[#2874F0] font-mono font-bold">
                  {step.hardwareFocus}
                </span>
              </div>
              <p className="text-[#666666] text-xs font-sans pl-7 leading-relaxed">{step.description}</p>
              <p className="text-[#878787] text-[11px] font-sans pl-7 italic">{step.explanation}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-[#E0E0E0] text-[#2874F0] text-[11px] font-bold whitespace-pre self-start sm:self-center font-mono shadow-xs">
              {step.codeSnippet}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Quiz Check */}
      <div className="p-4 rounded-xl bg-[#FFF8E1] border border-[#F09120]/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F09120]">
          <HelpCircle className="w-4 h-4" />
          <span>Knowledge Check Quiz</span>
        </div>

        <p className="text-xs font-bold text-[#212121]">{activeLesson.quiz.question}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {activeLesson.quiz.options.map((option, idx) => {
            const isChosen = selectedOption === option;
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isChosen
                    ? option.isCorrect
                      ? 'bg-[#E8F5E9] border-[#388E3C] text-[#388E3C] font-bold'
                      : 'bg-[#FFEBEE] border-[#E53935] text-[#E53935] font-bold'
                    : 'bg-white border-[#E0E0E0] text-[#212121] hover:border-[#2874F0]'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[#878787] font-bold">{String.fromCharCode(65 + idx)}.</span>
                  <span>{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {hasAnswered && selectedOption && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-in fade-in duration-200 ${
              selectedOption.isCorrect
                ? 'bg-[#E8F5E9] border-[#388E3C] text-[#388E3C]'
                : 'bg-[#FFEBEE] border-[#E53935] text-[#E53935]'
            }`}
          >
            {selectedOption.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-[#388E3C] shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-[#E53935] shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">
                {selectedOption.isCorrect ? 'Correct Answer!' : 'Not Quite!'}
              </span>
              <p className="mt-0.5">{selectedOption.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
