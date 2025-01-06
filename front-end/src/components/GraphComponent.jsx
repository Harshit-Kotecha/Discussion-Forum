import { useEffect, useState } from "react";

const GraphComponent = ({ relativeArrays, intervalDuration }) => {
  // eslint-disable-next-line no-undef
  const [currentValues, setCurrentValues] = useState(relativeArrays[0]); // Start with the first set of values
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % relativeArrays.length); // Cycle through the arrays
    }, intervalDuration);

    return () => clearInterval(interval); // Clean up on unmount
  }, [relativeArrays, intervalDuration]);

  useEffect(() => {
    setCurrentValues(relativeArrays[index]);
  }, [index, relativeArrays]);

  return (
    <div
      style={
        {
          // position: "relative",
          // display: "flex",
          // alignItems: "flex-end", // Align children to the bottom
          // justifyContent: "flex-start", // Align children to the left
          // height: "100%", // Set height for the parent container
          // width: "100%", // Optional, based on your layout
        }
      }
    >
      <div
        className="flex overflow-x-auto space-x-2"
        style={{
          position: "absolute",
          bottom: "24px",
          left: "24px",
          maxWidth: "300px", // You can change the max width to whatever fits your layout
          transform: "rotate(180deg)", // Rotate the entire container
        }}
      >
        {currentValues.map((value, index) => {
          const color =
            value <= 30
              ? "bg-red-500"
              : value >= 70
              ? "bg-green-500"
              : "bg-yellow-500"; // Customize color as per the range

          return (
            <div
              key={index}
              style={{
                width: "40px", // Fixed width for each bar
                height: `${value}px`, // The height depends on the value (height per value)
                transition: "height 0.5s ease",
              }}
              className={`${color} shadow-md`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GraphComponent;
