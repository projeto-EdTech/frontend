"use client";

import React from "react";

interface CronogramaMockupProps {
  isDark: boolean;
}

export function CronogramaMockup({ isDark }: CronogramaMockupProps) {
  return (
    <div
      className={`rounded-xl h-full flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? "bg-gray-800" : "bg-white"}`}
    >
      {/* Header with Action Buttons */}
      <div
        className={`border-b px-4 py-3 flex-shrink-0 transition-colors duration-300 ${isDark ? "bg-gradient-to-r from-indigo-900/50 to-blue-900/50 border-gray-700" : "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200"}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              className={`font-bold text-sm transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Cronograma de Estudos
            </h3>
            <p
              className={`text-xs transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Semana de 17 a 23 de janeiro
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold shadow-sm hover:shadow-md ${isDark ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filtros
            </button>
            <button
              className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold shadow-sm hover:shadow-md ${isDark ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Sugerir
            </button>
            <button className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-semibold shadow-md hover:shadow-lg">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        {/* Days Header */}
        <div
          className={`grid grid-cols-8 border-b sticky top-0 z-10 transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <div
            className={`p-2 text-center text-xs font-semibold border-r transition-colors duration-300 ${isDark ? "text-gray-400 border-gray-700" : "text-gray-600 border-gray-200"}`}
          >
            HORA
          </div>
          {[
            "DOM",
            "SEG",
            "TER",
            "QUA",
            "QUI",
            "SEX",
            "SÁB",
          ].map((day, idx) => (
            <div
              key={day}
              className={`p-2 text-center text-xs font-bold border-r transition-colors duration-300 ${
                idx === 1
                  ? isDark
                    ? "bg-blue-900/40 text-blue-400 border-gray-700"
                    : "bg-blue-100 text-blue-700 border-gray-200"
                  : isDark
                    ? "text-gray-400 border-gray-700"
                    : "text-gray-600 border-gray-200"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div
          className={`divide-y transition-colors duration-300 ${isDark ? "divide-gray-700" : "divide-gray-200"}`}
        >
          {[17, 18, 19, 20, 21].map((hour) => (
            <div
              key={hour}
              className={`grid grid-cols-8 min-h-16 transition-colors duration-300 ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}
            >
              <div
                className={`p-2 text-center text-xs font-mono border-r flex items-center justify-center transition-colors duration-300 ${isDark ? "text-gray-400 border-gray-700 bg-gray-800/50" : "text-gray-500 border-gray-200 bg-gray-50"}`}
              >
                {hour}:00
              </div>

              {/* Day 0 - DOM */}
              <div
                className={`border-r p-1 flex items-center justify-center relative transition-colors duration-300 ${isDark ? "border-gray-700" : "border-gray-200"}`}
              ></div>

              {/* Day 1 - SEG */}
              <div
                className={`border-r p-1 flex items-center justify-center relative transition-colors duration-300 ${isDark ? "border-gray-700" : "border-gray-200"}`}
              >
                {hour === 17 && (
                  <div className="w-full h-14 bg-cyan-500 rounded text-white text-[10px] p-1 flex flex-col justify-between shadow-md cursor-grab hover:shadow-lg transition-shadow">
                    <div className="font-semibold truncate">
                      Revisão ...
                    </div>
                    <div className="text-[9px]">
                      17:00 - 18:00
                    </div>
                  </div>
                )}
                {hour === 18 && (
                  <div className="w-full h-14 bg-red-500 rounded text-white text-[10px] p-1 flex flex-col justify-between shadow-md cursor-grab hover:shadow-lg transition-shadow">
                    <div className="font-semibold truncate">
                      Estudar ...
                    </div>
                    <div className="text-[9px]">
                      18:00 - 19:00
                    </div>
                  </div>
                )}
                {hour === 19 && (
                  <div className="w-full h-14 bg-orange-500 rounded text-white text-[10px] p-1 flex flex-col justify-between shadow-md cursor-grab hover:shadow-lg transition-shadow">
                    <div className="font-semibold truncate">
                      Geografi...
                    </div>
                    <div className="text-[9px]">
                      19:00 - 20:00
                    </div>
                  </div>
                )}
                {hour === 20 && (
                  <div className="w-full h-14 bg-orange-500 rounded text-white text-[10px] p-1 flex flex-col justify-between shadow-md cursor-grab hover:shadow-lg transition-shadow">
                    <div className="font-semibold truncate">
                      Geografi...
                    </div>
                    <div className="text-[9px]">
                      20:00 - 21:00
                    </div>
                  </div>
                )}
              </div>

              {/* Day 2 - TER */}
              <div className="border-r border-gray-200 p-1 flex items-center justify-center relative">
                {hour === 18 && (
                  <div className="w-full h-14 bg-red-500 rounded text-white text-[10px] p-1 flex flex-col justify-between shadow-md cursor-grab hover:shadow-lg transition-shadow">
                    <div className="font-semibold truncate">
                      Estudar ...
                    </div>
                    <div className="text-[9px]">
                      18:00 - 19:00
                    </div>
                  </div>
                )}
              </div>

              {/* Day 3 - QUA */}
              <div className="border-r border-gray-200 p-1 flex items-center justify-center relative">
                {hour === 17 && (
                  <div className="w-full h-14 bg-red-500 rounded text-white text-[10px] p-1 flex flex-col justify-between shadow-md cursor-grab hover:shadow-lg transition-shadow">
                    <div className="font-semibold truncate">
                      Estudar ...
                    </div>
                    <div className="text-[9px]">
                      17:00 - 18:00
                    </div>
                  </div>
                )}
                {hour === 21 && (
                  <div className="w-full h-14 bg-teal-500 rounded text-white text-[10px] p-1 flex flex-col justify-between shadow-md cursor-grab hover:shadow-lg transition-shadow">
                    <div className="font-semibold truncate">
                      Química ...
                    </div>
                    <div className="text-[9px]">
                      21:00 - 22:00
                    </div>
                  </div>
                )}
              </div>

              {/* Day 4 - QUI */}
              <div className="border-r border-gray-200 p-1 flex items-center justify-center relative">
                {hour === 20 && (
                  <div className="w-full h-14 bg-blue-500 rounded text-white text-[10px] p-1 flex flex-col justify-between shadow-md cursor-grab hover:shadow-lg transition-shadow">
                    <div className="font-semibold truncate">
                      Revisão ...
                    </div>
                    <div className="text-[9px]">
                      20:00 - 21:00
                    </div>
                  </div>
                )}
              </div>

              {/* Day 5 - SEX */}
              <div className="border-r border-gray-200 p-1 flex items-center justify-center relative">
                {hour === 19 && (
                  <div className="w-full h-14 bg-teal-500 rounded text-white text-[10px] p-1 flex flex-col justify-between shadow-md cursor-grab hover:shadow-lg transition-shadow">
                    <div className="font-semibold truncate">
                      Química ...
                    </div>
                    <div className="text-[9px]">
                      19:00 - 20:00
                    </div>
                  </div>
                )}
              </div>

              {/* Day 6 - SÁB */}
              <div className="p-1 flex items-center justify-center relative">
                {hour === 19 && (
                  <div className="w-full h-14 bg-teal-500 rounded text-white text-[10px] p-1 flex flex-col justify-between shadow-md cursor-grab hover:shadow-lg transition-shadow">
                    <div className="font-semibold truncate">
                      Química ...
                    </div>
                    <div className="text-[9px]">
                      19:00 - 20:00
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
