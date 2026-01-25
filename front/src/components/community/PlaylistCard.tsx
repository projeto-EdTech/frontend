import { motion } from "framer-motion";
import { Play, Heart, Layers, Divide, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaylistCardProps {
  title: string;
  creatorName: string;
  questionCount: number;
  likesCount: number;
  gradient: string;
  subjectIcons?: React.ReactNode;
  onClick?: () => void;
}

export function PlaylistCard({
  title,
  creatorName,
  questionCount,
  likesCount,
  gradient,
  subjectIcons,
  onClick,
}: PlaylistCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group flex flex-col gap-3 cursor-pointer w-full p-2 -m-2"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-gray-200 transition-shadow duration-300 group-hover:shadow-2xl">
        {/* Gradient Background */}
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />

        {/* Icons Overlay */}
        <div className="absolute inset-0 flex items-center justify-center text-white">
             {subjectIcons || <Layers className="w-12 h-12 text-white" />}
        </div>
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Play Button Overlay (Hover) */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl text-indigo-600 pl-1 opacity-0 group-hover:opacity-100"
          >
             <Play className="w-6 h-6 fill-current" />
          </motion.div>
        </div>
        
        {/* Count Badge Bottom Right */}
        <div className="absolute bottom-3 right-3 bg-white backdrop-blur-md border border-gray-200 px-2 py-1 rounded-lg text-gray-700 text-xs font-bold flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            <span>{questionCount}</span>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-1 px-1">
        <h3 className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors line-clamp-1 text-base leading-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
            By <span className="text-gray-700">{creatorName}</span>
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
            <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{likesCount}</span>
            </div>
             <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Questões</span>
            </div>
        </div>
      </div>
    </motion.div>
  );
}

export function PlaylistCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
      <div className="space-y-2 px-1">
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
