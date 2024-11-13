function Dot({ activeIndex }) {
  const arr = [1, 2, 3, 4];

  return (
    <div className="absolute bottom-8 mt-10 left-1/2 transform -translate-x-1/2 flex space-x-2">
      {arr.map((index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full border-2 ${
            activeIndex === index
              ? "bg-gray-400 border-none"
              : "border-gray-400"
          }`}
        />
      ))}
    </div>
  );
}

export default Dot;
