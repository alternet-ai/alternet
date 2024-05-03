"use client";

const Marquee: React.FC<{
  scrollAmount?: number;
  children: React.ReactNode;
}> = ({ children, scrollAmount = 20 }) => {
  return (
    <div
      className="marquee"
      style={{ "--scroll-amount": scrollAmount } as React.CSSProperties}
    >
      {children}
      <style jsx>{`
        .marquee {
          overflow: hidden;
          white-space: nowrap;
          animation: marquee 4s linear infinite alternate;
        }
        @keyframes marquee {
          from {
            transform: translateX(35%);
          }
          to {
            transform: translateX(-35%);
          }
        }
      `}</style>
    </div>
  );
};

export default Marquee;
