import React from 'react';

const TwoBoxes = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:space-x-4">
      <div className="bg-blue-500 lg:w-1/2">Box 1</div>
      <div className="bg-green-500 lg:w-1/2 mt-4 lg:mt-0">Box 2</div>
    </div>
  );
};

export default TwoBoxes;
