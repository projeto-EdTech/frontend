import React from 'react'
import { useDrag } from 'react-dnd'

const priorityColors: Record<'alta'|'media'|'baixa', string> = {
  alta: 'bg-red-500',
  media: 'bg-yellow-500',
  baixa: 'bg-green-500',
}

interface StudyCardProps {
  subject: string
  color: string
  priority: 'alta'|'media'|'baixa'
  onClick?: () => void
}

const StudyCard: React.FC<StudyCardProps> = ({ subject, color, priority, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'study-card',
    item: { subject, color, priority },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className="group relative p-4 bg-white/95 backdrop-blur-xl rounded-xl 
                 hover:bg-white hover:shadow-lg hover:shadow-black/5
                 transition-all duration-200 cursor-pointer
                 border border-gray-200/60 hover:border-gray-300/80
                 active:scale-[0.98]"
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isDragging 
          ? 'none' 
          : '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)'
      }}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0 shadow-sm ring-1 ring-black/5"
          style={{ backgroundColor: color }}
        ></div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-[15px] font-semibold leading-tight tracking-[-0.01em] truncate mb-1.5">
            {subject}
          </p>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${priorityColors[priority]} flex-shrink-0 shadow-sm`}
            ></div>
            <span className="text-gray-500 text-[13px] font-medium capitalize tracking-[-0.005em]">
              Prioridade: {priority}
            </span>
          </div>
        </div>
      </div>
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </div>
  )
}

export default StudyCard
