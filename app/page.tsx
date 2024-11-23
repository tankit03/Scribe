"use client";
import { useRouter } from "next/navigation";


export default function Home() {

  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/app/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#B8DAF7] via-[#F6F6F2] to-[#BCDBF3] text-center">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full bg-black text-white py-4 px-6 flex justify-end">
        <button 
          className="px-4 py-2 text-sm font-semibold text-white bg-gray-800 rounded hover:bg-gray-700"
          onClick={handleLoginClick}
        >
          Log In
        </button>
      </header>
      
      {/* Main Content */}
      <main className="flex flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-4" style={{ gap: "30px" }}>
          {/* SVG Logo */}
          <div className="w-[100px] h-[50px]">
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {/* SVG Text - SCRIBE */}
          <div className="w-[120px] h-[30px]">
            <img
              src="/SCRIBE.svg"
              alt="Text"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <p className="text-3xl text-gray-600 max-w-xl">
          The all-in-one tool for transcribing lectures, taking notes, and analyzing content
        </p>
        <button className="px-6 py-3 text-lg font-medium text-white bg-black rounded-full hover:bg-gray-800">
          Go Scribe →
        </button>
      </main>
    </div>
  );
}