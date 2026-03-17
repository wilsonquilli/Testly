export default function QuizQuestion({ question, select }) {

  return (
    <div className="mt-8">

      <h2 className="text-xl font-bold mb-4">
        {question.text}
      </h2>

      <div className="flex flex-col gap-3">

        {question.options.map((opt, index) => (
          <button
            key={index}
            onClick={() => select(index)}
            className="border p-3 rounded text-left"
          >
            {opt}
          </button>
        ))}

      </div>

    </div>
  );
}