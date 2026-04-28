import { motion } from "motion/react";
import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="p-4 sm:p-6 lg:px-14 xl:px-20 2xl:px-28 max-w-[1500px] mx-auto space-y-4 sm:space-y-6"
    >
      {children}
    </motion.div>
  );
}
