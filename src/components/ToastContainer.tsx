import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const iconMap = {
            success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
            info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
          };

          const bgMap = {
            success: "bg-white border-emerald-100 shadow-emerald-500/5 hover:border-emerald-200",
            error: "bg-white border-rose-100 shadow-rose-500/5 hover:border-rose-200",
            warning: "bg-white border-amber-100 shadow-amber-500/5 hover:border-amber-200",
            info: "bg-white border-sky-100 shadow-sky-500/5 hover:border-sky-200",
          };

          const lineMap = {
            success: "bg-emerald-500",
            error: "bg-rose-500",
            warning: "bg-amber-500",
            info: "bg-sky-500",
          };

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
              className={`pointer-events-auto relative p-4 rounded-2xl border bg-white shadow-xl flex gap-3 overflow-hidden ${bgMap[t.type]} transition-all`}
            >
              {/* Colored status strip left side */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${lineMap[t.type]}`} />
              
              {iconMap[t.type]}

              <div className="flex-1 min-w-0 pr-2">
                {t.title && (
                  <p className="text-xs font-bold text-slate-800 leading-tight mb-0.5">
                    {t.title}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                  {t.message}
                </p>
              </div>

              <button
                onClick={() => onClose(t.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shrink-0 align-top self-start"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
