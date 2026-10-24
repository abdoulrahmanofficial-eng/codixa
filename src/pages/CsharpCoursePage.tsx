import React from 'react';

export default function CsharpCoursePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">C# Programming Course</h1>
        <p className="text-slate-300 mb-8">Learn C# programming from fundamentals to advanced concepts.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Chapter 1: Introduction to C#</h2>
            <p className="text-slate-300 mb-4">Learn what C# is and why you should learn it. Understand the .NET ecosystem and set up your development environment.</p>
            <ul className="text-slate-400 space-y-2">
              <li>• What is C# and why learn it</li>
              <li>• Setting up .NET SDK</li>
              <li>• Visual Studio Code setup</li>
              <li>• Your first C# program</li>
            </ul>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Chapter 2: Basic C# Syntax</h2>
            <p className="text-slate-300 mb-4">Master C# syntax including variables, data types, operators, and control flow.</p>
            <ul className="text-slate-400 space-y-2">
              <li>• Variables and data types</li>
              <li>• Operators and expressions</li>
              <li>• Control flow (if, switch, loops)</li>
              <li>• Methods and functions</li>
            </ul>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Chapter 3: Object-Oriented Programming</h2>
            <p className="text-slate-300 mb-4">Learn OOP concepts in C#: classes, objects, inheritance, polymorphism, and interfaces.</p>
            <ul className="text-slate-400 space-y-2">
              <li>• Classes and objects</li>
              <li>• Inheritance and polymorphism</li>
              <li>• Interfaces and abstract classes</li>
              <li>• Collections and LINQ</li>
            </ul>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Chapter 4: Advanced Topics</h2>
            <p className="text-slate-300 mb-4">Explore advanced C# topics including async programming, error handling, and real-world applications.</p>
            <ul className="text-slate-400 space-y-2">
              <li>• Async/await patterns</li>
              <li>• Error handling and exceptions</li>
              <li>• File I/O operations</li>
              <li>• Real-world application development</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
}
