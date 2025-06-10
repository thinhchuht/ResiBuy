export const GiftIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ width = 36, height = 36, stroke = "#e57373" }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="60" width="120" height="100" rx="15" ry="15" fill="#e53935" stroke="#b71c1c" strokeWidth="3" />
      <rect x="30" y="45" width="140" height="30" rx="10" ry="10" fill="#c62828" stroke="#b71c1c" strokeWidth="3" />
      <rect x="95" y="45" width="10" height="115" rx="5" fill="#fff3f3" />
      <rect x="30" y="80" width="140" height="10" rx="5" fill="#fff3f3" />
      <path
        d="M90 50 
           C80 30, 60 30, 60 50 
           C60 70, 90 70, 90 80 
           C90 70, 120 70, 120 50 
           C120 30, 100 30, 90 50Z"
        fill="#ffcdd2"
        stroke={stroke}
        strokeWidth="2"
      />
    </svg>
  );
};

export default GiftIcon;
