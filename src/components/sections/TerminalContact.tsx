"use client";

import React, { useState } from "react";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";

interface CommandOutput {
  id: string;
  cmd: string;
  output: string | React.ReactNode;
}

export const TerminalContact = () => {
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<CommandOutput[]>([
    { id: "init-0", cmd: "init --system", output: "System initialized. Welcome to Ivo Zanacchi's interactive engineering terminal. Type 'help' or click the command chips below to explore." }
  ]);

  const handleCommand = (cmdToRun: string) => {
    const cleanCmd = cmdToRun.trim().toLowerCase();
    let response: React.ReactNode = "";

    switch (cleanCmd) {
      case "help":
        response = "Available commands: [stack] [experience] [contact] [github] [clear] [hire]";
        break;
      case "stack":
        response = "Backend: Python (FastAPI), Node.js, TypeScript. DevOps: Docker, Kubernetes, CI/CD, AWS. DBs: MongoDB, PostgreSQL, Pinecone RAG.";
        break;
      case "experience":
        response = "Full-Stack Software Engineer & DevOps specializing in zero-downtime architectures, multi-tenant SaaS platforms, and network protocol audits.";
        break;
      case "contact":
        response = (
          <span>
            Initiating direct communication protocol... Email: <a className="text-cyan-400 underline" href="mailto:ivozanacchi@example.com">ivozanacchi@example.com</a> {"//"} LinkedIn: <a className="text-cyan-400 underline" href="https://linkedin.com/in/ivozanacchi" rel="noopener noreferrer" target="_blank">linkedin.com/in/ivozanacchi</a>
          </span>
        );
        break;
      case "hire":
      case "sudo hire":
        response = "🚀 ACCESS GRANTED! High-priority recruitment routing activated. Send an immediate transmission to ivozanacchi@example.com to initiate contract discussions.";
        break;
      case "clear":
        setHistory([]);
        setInputVal("");
        return;
      default:
        response = `Command not recognized: '${cleanCmd}'. Type 'help' for available system directives.`;
    }

    setHistory((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, cmd: cmdToRun, output: response }]);
    setInputVal("");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal) return;
    handleCommand(inputVal);
  };

  return (
    <section className="w-full bg-neutral-950 py-32 relative z-10 border-t border-white/10">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-16 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-white/10 text-cyan-400 font-mono text-xs mb-4">
            <span>{"// 06. INTERACTIVE COLLABORATION HUB"}</span>
          </div>
          <h2 className="text-3xl md:text-6xl font-bold text-white tracking-tight !leading-[1.1] mb-4 antialiased subpixel-antialiased select-none">
            <VerticalCutReveal splitBy="words" staggerDuration={0.05} staggerFrom="first">
              INITIATE ENGINEERING DIALOGUE.
            </VerticalCutReveal>
          </h2>
          <p className="text-neutral-400 text-sm md:text-base font-sans max-w-xl">
            Execute commands below to inspect technical credentials, request architecture consultancies, or open a direct communication channel.
          </p>
        </div>

        {/* Terminal Window */}
        <div className="w-full rounded-2xl bg-neutral-900/90 border border-white/15 shadow-[0_30px_100px_rgba(0,0,0,0.95)] overflow-hidden font-mono text-xs sm:text-sm">
          {/* Mac Bar */}
          <div className="bg-neutral-950 px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-neutral-400 text-xs select-none">{"bash // ivo-zanacchi-cli (prod)"}</span>
            <div className="w-12" />
          </div>

          {/* Output Display */}
          <div className="p-6 min-h-[260px] max-h-[400px] overflow-y-auto flex flex-col gap-4 text-neutral-300 space-y-2 select-text">
            {history.map((item) => (
              <div key={item.id} className="leading-relaxed">
                <div className="text-cyan-400 flex items-center gap-2">
                  <span className="text-emerald-400">root@ivo-cluster:~$</span>
                  <span>{item.cmd}</span>
                </div>
                <div className="text-neutral-300 pl-4 pt-1 border-l-2 border-white/10 mt-1">
                  {item.output}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Chip Executables */}
          <div className="px-6 py-3 bg-neutral-950/60 border-t border-white/5 flex flex-wrap gap-2 items-center">
            <span className="text-neutral-500 text-xs mr-2">QUICK EXEC:</span>
            {["help", "stack", "experience", "contact", "sudo hire", "clear"].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => handleCommand(cmd)}
                className="px-3 py-1 rounded bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/10 text-neutral-300 transition-colors text-xs cursor-pointer"
              >
                [{cmd}]
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={onSubmit} className="bg-neutral-950 p-4 border-t border-white/10 flex items-center gap-3">
            <span className="text-emerald-400 font-bold">root@ivo-cluster:~$</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type command (e.g., 'contact' or 'sudo hire')..."
              className="flex-grow bg-transparent text-white focus:outline-none font-mono placeholder:text-neutral-600"
            />
            <button type="submit" className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold font-sans text-xs transition-colors cursor-pointer">
              EXECUTE ↵
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
