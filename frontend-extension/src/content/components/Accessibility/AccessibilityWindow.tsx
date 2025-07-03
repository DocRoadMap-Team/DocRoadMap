import React from "react";
import ContrastAdjuster from "./ContrastAdjuster";
import CorrectAlts from "./CorrectAlts";

const MainComponent: React.FC = () => {
  return (
    <div>
      <ContrastAdjuster />
      <CorrectAlts />
    </div>
  );
};

export default MainComponent;