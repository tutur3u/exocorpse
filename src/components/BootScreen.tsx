import { useSound } from "@/contexts/SoundContext";
import Image from "next/image";
import { useEffect, useState } from "react";

interface TerminalMessage {
  id: string;
  text: string;
  delay: number;
  displayedText: string;
  isTyping: boolean;
}

const BOOT_IMAGES = ["Fenrys.webp", "Morris.webp"];
const BACKGROUND_IMAGE = "/background-image.webp";

const getRandomBootImage = () => {
  return BOOT_IMAGES[Math.floor(Math.random() * BOOT_IMAGES.length)];
};

const TERMINAL_MESSAGES: Omit<TerminalMessage, "displayedText" | "isTyping">[] =
  [
    { id: "1", text: "> password detected...", delay: 300 },
    { id: "2", text: "> registering...", delay: 900 },
    { id: "3", text: "> it is currently XX:XX.", delay: 1500 },
    {
      id: "4",
      text: "> welcome, honorary luminary, to exocorpse.",
      delay: 2200,
    },
  ];

export default function BootScreen({
  onBootComplete,
}: {
  onBootComplete: () => void;
}) {
  const { playSound, stopSound } = useSound();
  const [currentTime, setCurrentTime] = useState("");
  const [randomBootImage] = useState(() => getRandomBootImage());
  const [messages, setMessages] = useState<TerminalMessage[]>(
    TERMINAL_MESSAGES.map((msg) => ({
      ...msg,
      displayedText: "",
      isTyping: false,
    })),
  );

  // Update local time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animate terminal messages and handle boot completion
  useEffect(() => {
    let hasCompleted = false;
    const timeouts: NodeJS.Timeout[] = [];
    const intervals: NodeJS.Timeout[] = [];

    // Schedule each message to start typing sequentially
    let cumulativeDelay = 0;

    TERMINAL_MESSAGES.forEach((msg, index) => {
      const fullText = msg.text.replace("XX:XX", currentTime);
      const typingDuration = fullText.length * 30; // 30ms per character

      const timeout = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, isTyping: true, displayedText: "" } : m,
          ),
        );

        // Type out each character
        let charIndex = 0;

        const interval = setInterval(() => {
          charIndex++;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id
                ? { ...m, displayedText: fullText.slice(0, charIndex) }
                : m,
            ),
          );

          if (charIndex >= fullText.length) {
            clearInterval(interval);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msg.id ? { ...m, isTyping: false } : m,
              ),
            );
          }
        }, 30); // 30ms per character for typing speed

        intervals.push(interval);
      }, cumulativeDelay);
      timeouts.push(timeout);

      // Add the typing duration of this message plus a small delay before the next one starts
      if (index < TERMINAL_MESSAGES.length - 1) {
        cumulativeDelay += typingDuration + 200;
      }
    });

    // Fallback timer - complete after 4 seconds even if audio fails
    const fallbackTimer = setTimeout(() => {
      if (!hasCompleted) {
        hasCompleted = true;
        onBootComplete();
      }
    }, 4000);
    timeouts.push(fallbackTimer);

    playSound("boot", {
      onend: () => {
        if (!hasCompleted) {
          hasCompleted = true;
          onBootComplete();
        }
      },
    });

    return () => {
      timeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
      intervals.forEach((interval) => {
        clearInterval(interval);
      });
      stopSound("boot");
    };
  }, [playSound, onBootComplete, stopSound, currentTime]);

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center overflow-hidden bg-cover bg-center">
      <Image
        src={BACKGROUND_IMAGE}
        alt="Background Image"
        fill
        preload={true}
        className="object-cover"
      />
      {/* Animated background pattern (optional subtle effect) */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-linear-to-br from-red-900/20 via-transparent to-blue-900/20" />
      </div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        {/* User Avatar */}
        <div className="animate-fadeIn">
          <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-full">
            <Image
              src={`/boot/${randomBootImage}`}
              alt="Boot Avatar"
              width={192}
              height={192}
              preload={true}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Terminal Messages */}
        <div className="min-h-[140px] text-center font-mono text-lg leading-relaxed">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`h-7 ${msg.displayedText ? "opacity-100" : "opacity-0"}`}
            >
              <span className="text-white">{msg.displayedText}</span>
              {msg.isTyping && <span className="animate-pulse">▋</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
