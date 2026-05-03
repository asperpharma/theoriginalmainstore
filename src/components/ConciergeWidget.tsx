import { useState } from 'react';

type Persona = 'sami' | 'rose' | null;

export default function ConciergeWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona>(null);

  // Reset to the lobby if closed
  const toggleConcierge = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setTimeout(() => setActivePersona(null), 300); // Wait for exit animation to clear state
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* The Concierge Window */}
      <div 
        className={`mb-4 w-[360px] md:w-[400px] overflow-hidden bg-[#FAF8F5]/95 backdrop-blur-md shadow-2xl border border-[#D4AF37]/30 origin-bottom-right transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-900 tracking-wide">
              {activePersona === 'sami' ? 'Dr. Sami' : activePersona === 'rose' ? 'Dr. Rose' : 'Digital Concierge'}
            </h3>
            <p className="text-[0.65rem] tracking-[0.2em] text-gray-400 uppercase mt-0.5">
              {activePersona === 'sami' ? 'Health & Wellness' : activePersona === 'rose' ? 'Beauty & Skincare' : 'Private Consultation'}
            </p>
          </div>
          <button 
            onClick={toggleConcierge}
            className="text-gray-400 hover:text-[#6A1E25] transition-colors p-1"
            aria-label="Close concierge"
          >
            ✕
          </button>
        </div>

        {/* The Body: Lobby vs. Active Chat */}
        <div className="h-[450px] flex flex-col relative">
          
          {/* STATE 1: The Persona Lobby */}
          <div className={`absolute inset-0 p-6 flex flex-col justify-center space-y-6 transition-opacity duration-500 ${activePersona ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="text-center mb-2">
              <p className="text-sm text-gray-600 leading-relaxed">
                Welcome to your personal sanctuary. <br/> How may we assist you today?
              </p>
            </div>

            {/* Dr. Sami Selection */}
            <button 
              onClick={() => setActivePersona('sami')}
              className="group flex items-center p-4 bg-white border border-transparent hover:border-[#D4AF37]/40 shadow-sm transition-all duration-300 hover:-translate-y-1 text-left"
            >
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:border-[#D4AF37] transition-colors">
                <span className="text-lg text-gray-500 font-serif group-hover:text-[#6A1E25]">S</span>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#6A1E25] transition-colors">Consult Dr. Sami</h4>
                <p className="text-xs text-gray-500 mt-1">Dermatological health & clinical wellness</p>
              </div>
            </button>

            {/* Dr. Rose Selection */}
            <button 
              onClick={() => setActivePersona('rose')}
              className="group flex items-center p-4 bg-white border border-transparent hover:border-[#D4AF37]/40 shadow-sm transition-all duration-300 hover:-translate-y-1 text-left"
            >
              <div className="h-12 w-12 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-colors">
                <span className="text-lg text-[#6A1E25] font-serif">R</span>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#6A1E25] transition-colors">Consult Dr. Rose</h4>
                <p className="text-xs text-gray-500 mt-1">Aesthetic skincare & routine building</p>
              </div>
            </button>
          </div>

          {/* STATE 2: The Chat Interface (Placeholder) */}
          <div className={`absolute inset-0 flex flex-col bg-white transition-opacity duration-500 ${activePersona ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-start mb-6">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${activePersona === 'sami' ? 'bg-gray-100 text-gray-500' : 'bg-[#FAF8F5] border border-[#D4AF37]/30 text-[#6A1E25]'}`}>
                  <span className="text-xs font-serif">{activePersona === 'sami' ? 'S' : 'R'}</span>
                </div>
                <div className="ml-3 bg-[#FAF8F5] border border-gray-100 p-3 text-sm text-gray-700 leading-relaxed rounded-br-lg rounded-tr-lg rounded-bl-lg">
                  {activePersona === 'sami' 
                    ? "Hello. I am Dr. Sami. Please describe any specific skin concerns, sensitivities, or clinical treatments you are currently undergoing."
                    : "Welcome! I am Dr. Rose. Tell me about your current beauty goals and the morning spa routine you are looking to achieve."}
                </div>
              </div>
            </div>
            
            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="w-full bg-[#FAF8F5] border-none focus:ring-1 focus:ring-[#D4AF37]/50 text-sm px-4 py-3 outline-none text-gray-700"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[0.65rem] tracking-widest text-[#6A1E25] uppercase font-medium hover:text-[#D4AF37] transition-colors px-2">
                  Send
                </button>
              </div>
              <button onClick={() => setActivePersona(null)} className="mt-3 text-[0.65rem] tracking-widest text-gray-400 uppercase hover:text-gray-600 flex items-center mx-auto">
                ← Return to Lobby
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* The Floating Trigger Button */}
      <button 
        onClick={toggleConcierge}
        className="h-14 w-14 bg-[#FAF8F5] border border-[#D4AF37]/40 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 group"
        aria-label="Open Digital Concierge"
      >
        <span className="text-[#6A1E25] font-serif text-xl tracking-tighter group-hover:text-[#D4AF37] transition-colors">
          {isOpen ? '✕' : 'A|B'}
        </span>
      </button>
      
    </div>
  );
}
