"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();

  // State for theme switcher
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleThemeSwitch = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    const textElement = document.querySelector('.typewriter-text') as HTMLElement | null;
    if (textElement) {  // Check if textElement is not null
      const text = textElement.textContent || '';  // Ensure text is a string
      textElement.textContent = '';

      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          textElement.textContent += text.charAt(index);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 45); // Adjust typing speed here
    }
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-gradient-to-b from-[#B8DAF7] via-[#F6F6F2] to-[#BCDBF3]'} text-center`}>
      {/* Header */}
      <header className="absolute top-0 left-0 w-full py-4 px-6 flex justify-between items-center">
        {/* Log In button on the right side */}
        <button 
          className="px-4 py-2 text-sm font-semibold text-white bg-black rounded hover:bg-gray-700 ml-auto"
          onClick={handleLoginClick}
        >
          Log In
        </button>

        {/* Theme Switcher */}
        <div
          className="md:absolute md:left-1/2 header-switcher flex items-center cursor-pointer h-full px-10 md:-translate-x-1/2"
          onClick={handleThemeSwitch}
        >
          <div className={`w-[1.2rem] h-[1.2rem] border-rem border-secondary ${isDarkMode ? 'bg-white' : 'bg-black'} rounded-full transition-mode`}></div>
          <div className={`w-[1.2rem] h-[1.2rem] border-rem border-secondary ${isDarkMode ? 'bg-black' : 'bg-white'} rounded-full -ml-[0.4rem] transition-mode`}></div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-4" style={{ gap: "30px" }}>
          {/* SVG Logo with color change */}
          <div className="w-[100px] h-[50px] transform transition-all duration-300">
            <img
              src="/logo.svg"
              alt="Logo"
              className={`w-full h-full object-contain ${isDarkMode ? 'filter invert' : ''}`} // Applies invert filter in dark mode
            />
          </div>
          {/* SVG Text - SCRIBE with color change */}
          <div className="w-[120px] h-[30px]">
            <img
              src="/SCRIBE.svg"
              alt="Text"
              className={`w-full h-full object-contain ${isDarkMode ? 'filter invert' : ''}`} // Applies invert filter in dark mode
            />
          </div>
        </div>
        <p 
          className={`typewriter-text text-2xl ${isDarkMode ? 'text-white' : 'text-gray-600'} max-w-xl`}
          style={{ fontFamily: 'Verdana, sans-serif' }}
        >
          The all-in-one tool for transcribing lectures, taking notes, and analyzing content.
        </p>
        <button 
          className={`px-6 py-3 text-lg font-medium ${isDarkMode ? 'text-black bg-white' : 'text-white bg-black'} rounded-full hover:bg-blue-600 transform hover:scale-110 transition-all duration-200`}
          onClick={handleLoginClick}
          style={{ fontFamily: 'Verdana, sans-serif' }}

        >
          Go Scribe →
        </button>


      </main>
    </div>
  );
}
