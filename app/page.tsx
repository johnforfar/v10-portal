import React from "react";
import { Button } from "@/components/button";
import { Wallet, User, GraduationCap, Cpu, TrendingUp, ArrowRight } from "lucide-react";

export default function IndexPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] py-12 px-4 space-y-12">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-3xl">
        <div className="size-20 rounded-2xl border border-blue-600/20 flex items-center justify-center shadow-2xl bg-blue-600/5 backdrop-blur-sm">
          <img src="/icon.png" alt="V10 Logo" className="w-12 h-12 object-contain" />
        </div>
        <h1 className="text-5xl font-bold text-white tracking-tight">
          Welcome to <span className="text-blue-500">V10 Portal</span>
        </h1>
        <p className="text-xl text-white/50 leading-relaxed font-medium">
          The unified command center for the OpenxAI Network. 
          Deploy nodes, master AI, and earn rewards in the decentralized grid.
        </p>
      </div>

      {/* CTA Section */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-blue-600/10 to-transparent border border-white/5 text-center space-y-6 shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Get Started</h2>
          <p className="text-white/60 text-sm">
            Connect your wallet and complete your profile to earn <span className="text-blue-400 font-bold tracking-widest uppercase">XP</span> and unlock exclusive rewards.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button className="w-full h-12 text-lg font-bold bg-[#2563eb] hover:bg-blue-500 shadow-lg shadow-blue-900/40 border-none">
            <Wallet className="mr-2 size-5" /> Connect Wallet
          </Button>
          <Button variant="outline" className="w-full h-12 text-lg font-bold border-white/10 hover:bg-white/5 text-white/70">
            <User className="mr-2 size-5" /> Complete Profile
          </Button>
        </div>
      </div>

      {/* Persona Selection */}
      <div className="w-full max-w-5xl space-y-6">
        <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] text-center">Select Your Path</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Developer */}
          <div className="group relative p-8 rounded-2xl bg-[#1A1B1C] border border-white/5 hover:border-blue-600/50 transition-all cursor-pointer overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Cpu className="size-10 text-blue-500 mb-6" />
            <h4 className="text-xl font-bold text-white mb-2">Developer</h4>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Build AI agents, contribute to the open-source grid, and earn XP for technical excellence.
            </p>
            <div className="flex items-center text-blue-400 text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
              Start Building <ArrowRight className="size-4 opacity-0 group-hover:opacity-100" />
            </div>
          </div>

          {/* Investor */}
          <div className="group relative p-8 rounded-2xl bg-[#1A1B1C] border border-white/5 hover:border-green-600/50 transition-all cursor-pointer overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <TrendingUp className="size-10 text-green-500 mb-6" />
            <h4 className="text-xl font-bold text-white mb-2">Investor</h4>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Stake tokens, participate in the tGPU marketplace, and monitor ecosystem performance.
            </p>
            <div className="flex items-center text-green-400 text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
              Explore Ecosystem <ArrowRight className="size-4 opacity-0 group-hover:opacity-100" />
            </div>
          </div>

          {/* Learner */}
          <div className="group relative p-8 rounded-2xl bg-[#1A1B1C] border border-white/5 hover:border-purple-600/50 transition-all cursor-pointer overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <GraduationCap className="size-10 text-purple-500 mb-6" />
            <h4 className="text-xl font-bold text-white mb-2">Learner</h4>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Access the Academy, master Web3 AI development, and claim your NFT certificates.
            </p>
            <div className="flex items-center text-purple-400 text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
              Join Academy <ArrowRight className="size-4 opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 w-full max-w-lg text-center">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">OpenxAI Studio v10 Powered by Hyperdrive</p>
      </div>
    </div>
  );
}
