import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';

interface WalletSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (walletName: string) => void;
}

// Generate a 12-word mnemonic phrase
const generateMnemonic = (): string[] => {
  const words = [
    'effort', 'submit', 'tail', 'fuel', 'net', 'square',
    'peasant', 'olive', 'crane', 'opera', 'choose', 'buzz'
  ];
  return words;
};

const steps = [
  { id: 1, name: 'Generate', icon: 'C' },
  { id: 2, name: 'Backup', icon: '📝' },
  { id: 3, name: 'Verify', icon: '✓' }
];

export default function WalletSetup({ isOpen, onClose, onComplete }: WalletSetupProps) {
  const [currentStep, setCurrentStep] = useState(1); // Start at generate step
  const [mnemonic] = useState<string[]>(generateMnemonic());
  const [selectedWords, setSelectedWords] = useState<Array<{index: number, word: string}>>([]);
  const [walletName, setWalletName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  if (!isOpen) return null;

  const handleGenerateNext = () => {
    setCurrentStep(2);
  };

  const handleBackupNext = () => {
    setCurrentStep(3);
  };

  const handleWordClick = (word: string) => {
    if (selectedWords.length < 12) {
      setSelectedWords([...selectedWords, { index: selectedWords.length + 1, word }]);
    }
  };

  const handleSelectedWordClick = (index: number) => {
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const handleVerify = () => {
    // Check if words are in correct order
    const isCorrect = selectedWords.every((selected, index) => selected.word === mnemonic[index]);
    if (isCorrect) {
      setShowNameInput(true);
    } else {
      alert('Incorrect order. Please try again.');
      setSelectedWords([]);
    }
  };

  const handleCreateWallet = () => {
    if (walletName.trim()) {
      onComplete(walletName.trim());
      onClose();
    }
  };

  // Shuffle words for verification
  const shuffledWords = [...mnemonic].sort(() => Math.random() - 0.5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-background rounded-2xl mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button onClick={onClose} className="hover:bg-secondary p-1 rounded">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-lg font-medium text-white">Create Wallet</h2>
          <div className="w-8" />
        </div>

        {!showNameInput ? (
          <>
            {/* Progress Steps */}
            <div className="flex justify-center items-center space-x-8 py-6">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    step.id < currentStep 
                      ? 'bg-primary' 
                      : step.id === currentStep 
                      ? 'bg-primary' 
                      : 'bg-gray-600'
                  }`}>
                    {step.id < currentStep ? <Check className="w-6 h-6" /> : step.icon}
                  </div>
                  <span className={`text-sm ${
                    step.id <= currentStep ? 'text-white' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="px-4 pb-6">
              {currentStep === 1 && (
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Generate New Wallet
                  </h3>
                  <p className="text-muted-foreground mb-8 text-sm">
                    We'll create a new wallet with a secure 12-word recovery phrase
                  </p>

                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">🔐</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateNext}
                    className="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Generate Wallet
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h3 className="text-xl font-bold text-white text-center mb-2">
                    Backup Mnemonic Phrase
                  </h3>
                  <p className="text-muted-foreground text-center mb-6 text-sm">
                    Write down the mnemonic phrase in order. Do not screenshot or send the phrase to others.
                  </p>
                  
                  {/* Mnemonic Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {mnemonic.map((word, index) => (
                      <div key={index} className="bg-secondary border border-border rounded-lg p-3">
                        <div className="text-muted-foreground text-xs mb-1">{index + 1}</div>
                        <div className="text-white font-medium">{word}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleBackupNext}
                    className="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h3 className="text-xl font-bold text-white text-center mb-2">
                    Verify Your Backup
                  </h3>
                  <p className="text-muted-foreground text-center mb-6 text-sm">
                    Click the words in the correct order
                  </p>

                  {/* Selected Words Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {Array.from({ length: 12 }, (_, index) => {
                      const selected = selectedWords[index];
                      return (
                        <button
                          key={index}
                          onClick={() => selected && handleSelectedWordClick(index)}
                          className="bg-secondary border border-border rounded-lg p-2 min-h-[40px] flex items-center justify-center text-sm"
                        >
                          <span className="text-muted-foreground text-xs mr-1">{index + 1}</span>
                          <span className="text-white">
                            {selected ? selected.word : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Word Options */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {shuffledWords.map((word, index) => (
                      <button
                        key={index}
                        onClick={() => handleWordClick(word)}
                        disabled={selectedWords.some(selected => selected.word === word)}
                        className="bg-secondary border border-border rounded-lg p-2 text-white text-sm hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {word}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={selectedWords.length !== 12}
                    className="w-full bg-muted text-muted-foreground py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verify
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Wallet Name Input */
          <div className="p-6">
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Name Your Wallet
            </h3>
            <p className="text-muted-foreground text-center mb-6 text-sm">
              Choose a name for your new wallet
            </p>
            
            <input
              type="text"
              placeholder="Enter wallet name"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-6"
              autoFocus
            />

            <button
              onClick={handleCreateWallet}
              disabled={!walletName.trim()}
              className="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
