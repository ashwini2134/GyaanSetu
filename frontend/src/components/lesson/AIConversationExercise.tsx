import React from 'react';

export default function AIConversationExercise(props: any) {
  return (
    <div className="p-5 border border-amber-500/20 bg-amber-900/10 rounded-2xl text-amber-200">
      <h3 className="font-bold">AI Conversation Exercise</h3>
      <p className="text-sm mt-2 opacity-80">This exercise type is currently under construction.</p>
      <button 
        onClick={props.onComplete}
        className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium"
      >
        Complete Exercise
      </button>
    </div>
  );
}
