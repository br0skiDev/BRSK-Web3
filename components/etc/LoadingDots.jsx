import { motion } from "framer-motion";

export const LoadingDots = () => {
  return (
    <div className="flex bg-slate-400/10 rounded-full mt-2 py-[11px] px-4 drop-shadow-lg">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
        className="w-2 h-2 rounded-full bg-red-500 mx-[7px]"
          animate={{
            scale: [1, 1.5, 1],
            transition: {
              duration: 1,
              repeat: Infinity,
              delay: index * 0.1,
            },
          }}
        />
      ))}
    </div>
  );
};
