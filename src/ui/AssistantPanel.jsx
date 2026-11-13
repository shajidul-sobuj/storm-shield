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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/80 shadow-2xl flex flex-col font-sans animate-slide-left text-slate-200">
      
      {/* Header */}
      <div className="p-4 bg-slate-950/90 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide text-white">Guided Assistant</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold">
                Grounded Q&A
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Strictly reviewed clinical library [A5]</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Layer 1 & 2: Procedure Voice Controls & Quick Command Bar */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Voice & Hands-Free Tools
          </span>
          {currentStepText && (
            <button
              onClick={handleReadCurrentStep}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isSpeaking 
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50' 
                  : 'bg-slate-850 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
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
            className="p-1.5 rounded-lg bg-slate-850 border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition text-center cursor-pointer"
          >
            Next Step
          </button>
          <button
            onClick={() => handleSendMessage('repeat')}
            className="p-1.5 rounded-lg bg-slate-850 border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition text-center cursor-pointer"
          >
            Repeat
          </button>
          <button
            onClick={() => handleSendMessage('start timer')}
            className="p-1.5 rounded-lg bg-slate-850 border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition text-center cursor-pointer"
          >
            Timer
          </button>
          <button
            onClick={() => handleSendMessage('alert crew')}
            className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 transition text-center font-bold cursor-pointer"
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
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md'
                    : m.isEmergency
                    ? 'bg-rose-950/80 text-rose-200 border border-rose-500/60 rounded-bl-none font-medium'
                    : 'bg-slate-800/80 text-slate-200 rounded-bl-none border border-slate-700/80'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>

                {/* Citation & Approval Badging */}
                {!isUser && (m.source || m.approval) && (
                  <div className="mt-2 pt-2 border-t border-slate-700/60 flex flex-wrap items-center gap-1.5 text-[10px]">
                    {m.source && (
                      <span className="font-mono text-cyan-400 font-medium">
                        Src: {m.source}
                      </span>
                    )}
                    {m.approval && (
                      <span className="px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-500/40">
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
      <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-850 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
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
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse border-rose-500'
                : 'bg-slate-850 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700'
            }`}
          >
            🎤
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask question or say 'next step'..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Send
          </button>
        </form>
        <div className="mt-1.5 text-center text-[10px] text-slate-500">
          Answers only from reviewed library · Emergency phrases bypass chat immediately
        </div>
      </div>

    </div>
  );
}
