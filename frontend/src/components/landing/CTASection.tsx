import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="bg-[#05050a] py-24">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full bg-gradient-to-br from-blue-950/50 to-transparent border-y border-[#3b82f6]/30 py-32 px-6 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            Your first lecture is one click away.
          </h2>
          <p className="text-lg text-[#93c5fd]/70 mb-12">
            Free to start. No credit card. No distractions. Just learning.
          </p>
          <Link to="/register" className="inline-flex px-10 py-5 bg-[#3b82f6] hover:bg-blue-500 text-white rounded-full font-bold text-lg items-center gap-3 transition-all duration-300 shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_0px_rgba(59,130,246,0.6)] hover:scale-105">
            Create Your Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
