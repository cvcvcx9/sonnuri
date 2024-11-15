// InfoSection.js
import React from "react";

function InfoSection({ number, title, description, image, titleImage, titleImageWidth  }) {
  return (
    <div className="flex flex-col items-start space-y-4 w-1/2 pt-20 pl-60 pb-8">
      <div className="flex items-center space-x-2">
        <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-lg font-semibold">
          {number}
        </span>
        {/* <h2 className="text-4xl font-semibold pl-2">{title}</h2> */}

        <img
              src={titleImage}
              alt="Title 이미지"
              className="h-auto"
              style={{ width: titleImageWidth }}
            />
      </div>
      <div className="text-gray-700 pt-4 text-2xl">
        <p>{description}</p>
      </div>
      <img
        src={image}
        alt={`${title} 이미지`}
        className="w-auto h-80 pt-4 ml-20"
      />
    </div>
  );
}

export default InfoSection;
