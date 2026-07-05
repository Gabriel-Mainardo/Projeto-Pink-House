export default function VerifyBadge() {
  return (
    <div className="flex flex-col items-center font-sans select-none">
      <div
        className="flex h-[24px] w-[90px] border border-[#d4d4d4] rounded-[4px] overflow-hidden shadow-sm"
        style={{ boxShadow: "inset 0 0 1px rgba(0,0,0,0.25)" }}
      >
        <div
          className="flex-1"
          style={{
            background: "linear-gradient(180deg, #FF5038 0%, #E83A20 100%)",
          }}
        />
        <div
          className="flex-1"
          style={{
            background: "linear-gradient(180deg, #FFB92C 0%, #E69C00 100%)",
          }}
        />
        <div
          className="flex-1"
          style={{
            background: "linear-gradient(180deg, #32E56D 0%, #1FB855 100%)",
          }}
        />
      </div>

      <span className="text-[13px] text-[#3f3f46] mt-[5px] leading-none font-medium">
        verificado
      </span>
    </div>
  );
}
