import React, { useState, useEffect, useRef } from 'react';
import { askAssistant } from '../assistant/answer.js';
import { speakText, stopSpeaking, isSpeechSupported } from '../assistant/speak.js';
import { createSpeechRecognizer, isListeningSupported } from '../assistant/listen.js';
import { parseCommand } from '../assistant/commands.js';
import { alertSystem } from '../engine/alerts.js';

export default function AssistantPanel({ 
  isOpen, 
  onClose, 
  astronaut, 
  currentStepText = null,
  onExecuteCommand = null 
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Storm Shield Medical Assistant active. I answer questions strictly from the reviewed mission clinical library. How can I help with crew assessment?",
      source: 'nasa-eimo-2025',
      approval: { id: 'A5', status: 'pending' },
      isEmergency: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognizerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend = inputValue) => {
    const text = textToSend.trim();
    if (!text) return;

    // Check if it's an actionable command first
    const cmd = parseCommand(text);
    if (cmd.action !== 'UNKNOWN' && onExecuteCommand) {
      onExecuteCommand(cmd);
      setMessages(prev => [
        ...prev,
        { sender: 'user', text },
        { 
          sender: 'assistant', 
          text: `Executed procedure command: [${cmd.action}].`, 
          source: 'nasa-cds-2022',
          approval: { id: 'A5', status: 'pending' }
        }
      ]);
      setInputValue('');
      return;
    }

    // Process Q&A via grounded assistant engine
    const response = askAssistant(text, astronaut);

    setMessages(prev => [
      ...prev,
      { sender: 'user', text },
      {
        sender: 'assistant',
        text: response.text,
        source: response.source,
        approval: response.approval,
        isEmergency: response.isEmergency,
        citationBadge: response.citationBadge
      }
    ]);
    setInputValue('');

    // If emergency, stop speaking and let alert siren sound
    if (response.isEmergency) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(response.text, () => setIsSpeaking(false), () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  const handleToggleVoiceInput = () => {
    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!isListeningSupported()) {
      alert('Speech recognition is not supported in this browser. Please type your query or use the quick buttons.');
      return;
    }

    const rec = createSpeechRecognizer(
      (transcript) => {
        setIsListening(false);
        handleSendMessage(transcript);
      },
      (err) => {
        console.warn('Speech rec error:', err);
        setIsListening(false);
      },
      () => setIsListening(false)
    );

    if (rec) {
      recognizerRef.current = rec;
      rec.start();
      setIsListening(true);
    }
  };

  const handleReadCurrentStep = () => {
    if (!currentStepText) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    speakText(currentStepText, () => setIsSpeaking(false), () => setIsSpeaking(false));
    setIsSpeaking(true);
  };

  if (!isOpen) return null;

  const quickPrompts = [
    "Can I give aspirin for chest discomfort?",
    "Is wearable skin temperature the same as core temp?",
    "How does the dead-man check-in timer work?",
    "What is the S3 storm shelter protocol?"
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col font-sans animate-slide-left">
      
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold text-sm">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide">Guided Assistant</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 font-semibold">
                Grounded Q&A
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Strictly reviewed clinical library [A5]</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          ✕
        </button>
      </div>

      {/* Layer 1 & 2: Procedure Voice Controls & Quick Command Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Voice & Hands-Free Tools
          </span>
          {currentStepText && (
            <button
              onClick={handleReadCurrentStep}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isSpeaking 
                  ? 'bg-rose-100 text-rose-700 border border-rose-300' 
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{isSpeaking ? '⏹ Stop Voice' : '🔊 Read Step Aloud'}</span>
            </button>
          )}
        </div>

        {/* Rapid Button Commands */}
        <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => handleSendMessage('next step')}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-sky-400 hover:text-sky-600 transition text-center"
          >
            Next Step
          </button>
          <button
            onClick={() => handleSendMessage('repeat')}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-sky-400 hover:text-sky-600 transition text-center"
          >
            Repeat
          </button>
          <button
            onClick={() => handleSendMessage('start timer')}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-sky-400 hover:text-sky-600 transition text-center"
          >
            Timer
          </button>
          <button
            onClick={() => handleSendMessage('alert crew')}
            className="p-1.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 transition text-center font-bold"
          >
            Alert Crew
          </button>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : m.isEmergency
                    ? 'bg-rose-100 text-rose-950 border border-rose-400 rounded-bl-none font-medium'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>

                {/* Citation & Approval Badging */}
                {!isUser && (m.source || m.approval) && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-[10px]">
                    {m.source && (
                      <span className="font-mono text-slate-500 font-medium">
                        Src: {m.source}
                      </span>
                    )}
                    {m.approval && (
                      <span className="px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                        {m.approval.id}: pending medical review
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 transition"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            title={isListening ? "Listening... click to stop" : "Click to speak voice command"}
            className={`p-2.5 rounded-xl border transition ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse border-rose-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
            }`}
          >
            🎤
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask question or say 'next step'..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition"
          >
            Send
          </button>
        </form>
        <div className="mt-1.5 text-center text-[10px] text-slate-400">
          Answers only from reviewed library · Emergency phrases bypass chat immediately
        </div>
      </div>

    </div>
  );
}
