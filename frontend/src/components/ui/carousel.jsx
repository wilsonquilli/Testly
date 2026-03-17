"use client";

import { useEffect, useRef } from "react";

const majors = [
  { name: "Computer Science", icon: "💻" },
  { name: "Mathematics", icon: "➕" },
  { name: "Physics", icon: "🧲" },
  { name: "Biology", icon: "🧬" },
  { name: "Chemistry", icon: "⚗️" },
  { name: "Economics", icon: "💰" },
  { name: "Psychology", icon: "🧠" },
  { name: "Art", icon: "🎨" },
  { name: "Music", icon: "🎵" },
  { name: "Engineering", icon: "⚙️" },
  { name: "Philosophy", icon: "🪬" },
  { name: "History", icon: "📜" },
  { name: "Political Science", icon: "🏛️" },
  { name: "Sociology", icon: "👥" },
  { name: "Anthropology", icon: "🦴" },
  { name: "Environmental Science", icon: "🌿" },
  { name: "Neuroscience", icon: "🔬" },
  { name: "Architecture", icon: "🏗️" },
  { name: "Film Studies", icon: "🎬" },
  { name: "Linguistics", icon: "🗣️" },
  { name: "Nursing", icon: "🩺" },
  { name: "Business Administration", icon: "📊" },
  { name: "Marketing", icon: "📣" },
  { name: "Finance", icon: "💹" },
  { name: "Accounting", icon: "🧾" },
  { name: "Law", icon: "⚖️" },
  { name: "Education", icon: "📚" },
  { name: "Journalism", icon: "📰" },
  { name: "Public Health", icon: "🏥" },
  { name: "Astronomy", icon: "🔭" },
  { name: "Biochemistry", icon: "🧪" },
  { name: "Data Science", icon: "📈" },
  { name: "Cybersecurity", icon: "🔐" },
  { name: "Theater", icon: "🎭" },
  { name: "Dance", icon: "🩰" },
  { name: "Graphic Design", icon: "✏️" },
  { name: "Mechanical Engineering", icon: "🔩" },
  { name: "Electrical Engineering", icon: "⚡" },
  { name: "Civil Engineering", icon: "🌉" },
  { name: "Biomedical Engineering", icon: "🫀" },
  { name: "International Relations", icon: "🌐" },
  { name: "Social Work", icon: "🤝" },
  { name: "Statistics", icon: "📉" },
  { name: "Geology", icon: "🪨" },
  { name: "Oceanography", icon: "🌊" },
  { name: "Veterinary Science", icon: "🐾" },
  { name: "Pharmacy", icon: "💊" },
  { name: "Kinesiology", icon: "🏃" },
  { name: "Religious Studies", icon: "🕊️" },
  { name: "Creative Writing", icon: "✍️" },
];

function ElevatorColumn({ initialDirection = 1, speed = 0.8 }) {
  const containerRef = useRef(null);

  const repeated = [...majors, ...majors, ...majors];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const itemHeight = 128; 
    const singleSetHeight = majors.length * itemHeight;

    container.scrollTop = singleSetHeight;

    let scrollTop = singleSetHeight;
    let direction = initialDirection;
    let animationFrame;

    function step() {
      scrollTop += speed * direction;

      if (scrollTop >= singleSetHeight * 2) {
        scrollTop -= singleSetHeight;
      }

      if (scrollTop <= 0) {
        scrollTop += singleSetHeight;
      }

      container.scrollTop = scrollTop;
      animationFrame = requestAnimationFrame(step);
    }

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [initialDirection, speed]);

  return (
    <div className="w-70 h-[750px] overflow-hidden border-2 border-black rounded-xl">
      <div
        ref={containerRef}
        className="flex flex-col overflow-y-scroll h-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {repeated.map((major, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 text-black dark:text-white h-32 px-5 font-patua text-xl border-b border-gray-200 flex-shrink-0"
          >
            <span className="text-3xl">{major.icon}</span>
            <span>{major.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Carousel() {
  return (
    <div className="flex justify-center gap-6 mt-10">
      <ElevatorColumn initialDirection={1} speed={0.8} />
      <ElevatorColumn initialDirection={-1} speed={0.8} />
    </div>
  );
}