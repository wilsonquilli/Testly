"use client";

import { useState } from "react";
import NotesInput from "@/components/ui/notesinput";
import QuizQuestion from "@/components/ui/quizquestion";
import Results from "@/components/ui/results";

export default function Dashboard() {

  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  const generateQuiz = async (notes) => {

    const sampleQuiz = [
      {
        text: "What is photosynthesis?",
        options: [
          "Plant energy process",
          "Animal digestion",
          "Protein synthesis",
          "Cell division"
        ],
        answer: 0
      }
    ];

    setQuiz(sampleQuiz);
  };

  const selectAnswer = (index) => {

    if (index === quiz[current].answer) {
      setScore(score + 1);
    }

    setCurrent(current + 1);
  };

  if (!quiz) {
    return <NotesInput generateQuiz={generateQuiz} />;
  }

  if (current >= quiz.length) {
    return <Results score={score} total={quiz.length} />;
  }

  return (
    <QuizQuestion
      question={quiz[current]}
      select={selectAnswer}
    />
  );
}