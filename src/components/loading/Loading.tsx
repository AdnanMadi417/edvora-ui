import React from "react";

interface LoadingProps {
  size?: number;
  color?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
                                           size = 50,
                                           color = "#2563eb",
                                           text = "Loading...",
                                         }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div
        style={{
          width: size,
          height: size,
          border: `5px solid ${color}`,
          borderTop: `5px solid transparent`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      ></div>
      {text && <p className="mt-3 text-gray-600">{text}</p>}

      <style jsx>{`
          @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
          }
      `}</style>
    </div>
  );
};

export default Loading;
