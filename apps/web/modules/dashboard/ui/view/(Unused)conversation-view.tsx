import Image from "next/image";
export const ConversationView = () => {
  return (
    <div className="flex h-full flex-1 flex-col gap-y-4 bg-muted">
      <div className="flex flex-1 gap-x-2 items-center justify-center">
        <Image
          alt="logo"
          height={40}
          width={40}
          src="/logo.svg"
        />
        <p className="font-semibold text-lg">Trellis</p>
      </div>
    </div>
  );
};
