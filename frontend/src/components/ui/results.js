export default function Results({ score, total }) {

  return (
    <div className="mt-10 text-center">

      <h2 className="text-3xl font-bold">
        Results
      </h2>

      <p className="text-xl mt-4">
        Score: {score} / {total}
      </p>

    </div>
  );
}