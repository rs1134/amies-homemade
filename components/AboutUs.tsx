import React from 'react';
import { Heart, Sparkles, Utensils, ShieldCheck } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em]">
            The Story of amie's
          </span>
          <h1 className="text-5xl sm:text-7xl font-bold text-[#4A3728] serif mt-6">From Our Kitchen to Yours</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-coral/10 custom-curve transform -rotate-6 scale-110"></div>
              <img 
                src="https://i.postimg.cc/q7hjrFPY/Whats-App-Image-2026-02-19-at-17-35-38.jpg" 
                className="relative rounded-[3rem] shadow-2xl z-10 w-full aspect-[4/5] object-cover object-top border-[12px] border-white" 
                alt="Ami Shah - Founder" 
              />
              <div className="absolute -bottom-6 -right-2 sm:-bottom-8 sm:-right-8 bg-[#F6C94C] p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-2xl z-20 border-4 border-white">
                <p className="text-xl sm:text-3xl font-bold text-[#F04E4E] brand-script mb-0.5 text-center leading-none">Ami Shah</p>
                <p className="text-[8px] sm:text-[10px] brand-rounded font-black uppercase tracking-[0.2em] text-[#4A3728] text-center">Founder</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-bold serif text-[#4A3728]">A Legacy of Flavor</h2>
            <p className="text-xl text-[#4A3728]/70 leading-relaxed">
              It all started in a small home kitchen in Ahmedabad. A passion for preserving the flavors that remind you of home, family recipes passed down through generations, and a belief that homemade will always taste better.
            </p>
            <p className="text-xl text-[#4A3728]/70 leading-relaxed">
              What started as treats for family and neighbors has grown into something special. But nothing else has changed. Same hands, same recipes, same love in every batch.
            </p>
            
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-coral rounded-2xl flex items-center justify-center text-white">
                  <Heart size={24} fill="currentColor" />
                </div>
                <h4 className="font-bold brand-rounded text-sm uppercase">Made with Love</h4>
                <p className="text-xs text-[#4A3728]/60">Pure intentions in every ingredient.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-[#F6C94C] rounded-2xl flex items-center justify-center text-[#4A3728]">
                  <Utensils size={24} />
                </div>
                <h4 className="font-bold brand-rounded text-sm uppercase">Traditional Recipes</h4>
                <p className="text-xs text-[#4A3728]/60">Time-honored preparation methods.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/50 rounded-[4rem] p-12 sm:p-20 text-center border border-coral/5">
          <h2 className="text-4xl font-bold serif mb-12">Why Choose amie's?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: <ShieldCheck className="text-green-500" />, title: "100% Homemade", desc: "No factories, just our kitchen." },
              { icon: <Sparkles className="text-yellow-500" />, title: "No Preservatives", desc: "Always fresh, always natural." },
              { icon: <Utensils className="text-orange-500" />, title: "Premium Ingredients", desc: "Only the best for you." },
              { icon: <Heart className="text-red-500" />, title: "Hygienically Prepared", desc: "Your health is our priority." }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-3xl shadow-lg mb-2">{item.icon}</div>
                <h4 className="font-bold brand-rounded text-sm uppercase">{item.title}</h4>
                <p className="text-xs text-[#4A3728]/60 max-w-[150px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;