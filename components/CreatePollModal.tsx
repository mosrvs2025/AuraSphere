
import React, { useState } from 'react';
// FIX: Corrected import path for Icons.
import { PlusIcon, TrashIcon } from './Icons.tsx';

interface CreatePollModalProps {
  onClose: () => void;
  onCreate: (question: string, options: string[]) => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({ onClose, onCreate }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };
  
  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const canSubmit = question.trim() && options.every(opt => opt.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onCreate(question.trim(), options.map(opt => opt.trim()));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg m-4 text-white shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-6">Create a Poll</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="poll-question" className="block text-sm font-medium text-gray-300 mb-2">Question</label>
            <input
              id="poll-question"
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="What do you want to ask?"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Options</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={e => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button type="button" onClick={() => removeOption(index)} disabled={options.length <= 2} className="p-2 text-gray-400 hover:text-red-400 disabled:text-gray-600 disabled:cursor-not-allowed">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button type="button" onClick={addOption} disabled={options.length >= 5} className="w-full flex items-center justify-center space-x-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 disabled:text-gray-500 disabled:cursor-not-allowed transition py-2">
            <PlusIcon className="h-5 w-5" />
            <span>Add Option</span>
          </button>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-5 rounded-full text-sm transition">Cancel</button>
            <button type="submit" disabled={!canSubmit} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-5 rounded-full text-sm transition disabled:bg-indigo-800/50 disabled:cursor-not-allowed">Start Poll</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;