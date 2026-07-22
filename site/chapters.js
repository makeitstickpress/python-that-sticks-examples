export const chapters = [
  {
    num: 1,
    topic: "first steps",
    title: "Create your first flashcard",
    examples: [
      {
        id: "first-message",
        heading: "Make Python display one line",
        instruction: "Worked example",
        intro: "Run the smallest visible Quizzical program, then change the message and run it again.",
        code: `print("Welcome to Quizzical!")`,
      },
      {
        id: "first-flashcard",
        heading: "Display the complete first flashcard",
        instruction: "Worked example",
        intro: "The empty print calls create the two blank console lines that separate the title, question, and answer.",
        code: `print("QUIZZICAL")
print()

print("Question:")
print("Which planet is known as the Red Planet?")
print()

print("Answer:")
print("Mars")`,
      },
      {
        id: "variables",
        heading: "Give the question and answer names",
        instruction: "Worked example",
        intro: "Change either assigned string. The print calls stay the same, but the console uses the new value.",
        code: `question = "Which planet is known as the Red Planet?"
answer = "Mars"

print("QUIZZICAL")
print()

print("Question:")
print(question)
print()

print("Answer:")
print(answer)`,
      },
      {
        id: "your-turn",
        heading: "Your turn: create a Tokyo flashcard",
        instruction: "Exercise",
        intro: "Complete the two empty strings. Do not change the seven print calls. Compare your console with the goal in the book.",
        code: `question = ""
answer = ""

print("QUIZZICAL")
print()

print("Question:")
print(question)
print()

print("Answer:")
print(answer)`,
      },
      {
        id: "answer",
        heading: "One possible answer",
        instruction: "Answer",
        intro: "The variable names now refer to the Tokyo question and answer strings, while the output structure remains unchanged.",
        code: `question = "Which city is the capital of Japan?"
answer = "Tokyo"

print("QUIZZICAL")
print()

print("Question:")
print(question)
print()

print("Answer:")
print(answer)`,
      },
    ],
  },
];

export function getChapter(number) {
  return chapters.find((chapter) => chapter.num === Number(number));
}

