import React, { useState } from "react";

const LikertScaleCard = () => {
  const initialChoices = {
    fbSectionA1: 0,
    fbSectionA2: 0,
    fbSectionA3: 0,
    fbSectionA4: 0,
    fbSectionA5: 0,
  };

const [choices, setChoices] = useState(initialChoices);

const handleOptionChange = (question: string, value: number) => {
  setChoices((prevChoices) => {
    const updatedChoices = {
      ...prevChoices,
      [question]: value,
    };
    console.log(updatedChoices); // Log the updated state
    return updatedChoices;
  });
};
  


const handleClearSelection = () => {
    setChoices(initialChoices);
};

const options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
const anyOptionSelected = Object.values(choices).some((value) => value !== null);

  return (
    <div className="mb-8 p-2 pr-2 md:pr-[100px] py-8 pl-2 md:pl-5 bg-white rounded-lg relative">
      <h2 className="text-2xl font-bold mb-6 text-left  -mt-3 ml-[5px]">Assessment Criteria</h2>
      <h3 className="text-xl font-normal mb-6 text-left  -mt-3 ml-[5px]">A. Course Quality</h3> 
      {["The contents were clear and easy to understand.", "The course objectives were successfully achieved.", "The course materials were enough and helpful.", "The class environment enabled me to learn.", "The program was well coordinated (e.g. registration, pre-program information, etc.)"].map((question, index) => (
        <div className="mb-4" key={question}>
        <p className="ttext-gray-700 text-sm lg:text-base font-medium mb-6 mt-3 ml-[5px]">{question}</p>
        <div className="flex flex-wrap justify-center">
            {options.map((label, optionIndex) => (
                <label key={label} className="mr-4 flex items-center mb-2">
                    <input
                        type="radio"
                        name={`fbSectionA${index + 1}`}
                        value={optionIndex + 1}
                        className="mr-2"
                        checked={choices[`fbSectionA${index + 1}` as keyof typeof choices] === optionIndex + 1}
                        onChange={() => handleOptionChange(`fbSectionA${index + 1}` as keyof typeof choices, optionIndex + 1)}
                    />
                    {label}
                </label>
            ))}
          </div>
        </div>
      ))}

      {anyOptionSelected && (
        <button
          className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded bottom-4 right-4 opacity-40 md:absolute transition duration-300 ease-in-out"
          onClick={(event) => {
            event.preventDefault();
            handleClearSelection();
          }}
        >
          Clear Selection
        </button>
      )}
    </div>

  

  );
};

export { LikertScaleCard };
