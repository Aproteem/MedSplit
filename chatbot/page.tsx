"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Send } from "lucide-react";

type Role = "user" | "assistant" | "system";
type Msg = {
  role: Role;
  content: string;
  fileUrl?: string;
  fileName?: string;
};

const FLASK_URL: string = process.env.NEXT_PUBLIC_FLASK_URL || "http://localhost:5000";

export default function Page(): JSX.Element {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(e?: React.FormEvent<HTMLFormElement>): Promise<void> {
    e?.preventDefault();
    if ((!input.trim() && !file) || loading) return;

    let fileUrl: string | undefined;
    let fileName: string | undefined;
    if (file) {
      fileUrl = URL.createObjectURL(file);
      fileName = file.name;
    }

    const next: Msg[] = [...messages, { role: "user", content: input.trim(), fileUrl, fileName }];
    setMessages(next);
    setInput("");
    setFile(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("messages", JSON.stringify(next));
      if (file) formData.append("file", file);

      const res = await fetch(`${FLASK_URL}/chat`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const data: { reply: string } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${err?.message || "Request failed"}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">✨ Gemini Chat Clone</h1>
        </div>
      </header>

      {/* MESSAGES */}
      <main className="flex-1 flex flex-col items-center w-full">
        <div className="w-full max-w-3xl flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[75%] text-sm leading-relaxed shadow-md ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {m.fileUrl && (
                    <div className="mb-2 text-xs">
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-blue-200 underline"
                      >
                        <Paperclip className="w-3 h-3" /> {m.fileName || "Uploaded file"}
                      </a>
                    </div>
                  )}
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl px-4 py-3 bg-white border text-sm shadow-sm animate-pulse">
                Assistant is typing…
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* INPUT BAR */}
        <form
          onSubmit={sendMessage}
          className="w-full max-w-3xl border-t bg-white/90 backdrop-blur-md p-4 flex items-end gap-2 shadow-inner"
        >
          {/* File Upload */}
          <label className="relative cursor-pointer flex items-center justify-center rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
            <Paperclip className="w-4 h-4 mr-1" />
            Attach
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          {/* Text Input */}
          <textarea
            className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm transition"
            rows={2}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {/* Send Button */}
          <motion.button
            type="submit"
            disabled={loading || (!input.trim() && !file)}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium shadow-md hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition"
          >
            <Send className="w-4 h-4" />
            Send
          </motion.button>
        </form>
      </main>
    </div>
  );
}
