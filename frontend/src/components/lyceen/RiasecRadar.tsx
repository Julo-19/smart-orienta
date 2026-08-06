"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Dimension, DIMENSION_COLORS, DIMENSION_LABELS } from "@/lib/riasecQuestions";

interface RiasecRadarProps {
  scores: Record<Dimension, number>;
}

const DIMENSIONS: Dimension[] = ["R", "I", "A", "S", "E", "C"];

export default function RiasecRadar({ scores }: RiasecRadarProps) {
  const data = DIMENSIONS.map((dim) => ({
    dimension: dim,
    score: scores[dim] || 0,
    fullMark: 5,
  }));

  // Tri par score décroissant pour le tableau
  const sorted = [...DIMENSIONS].sort((a, b) => scores[b] - scores[a]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
        Profil RIASEC
      </h3>

      {/* Radar */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 13, fontWeight: 700, fill: "#374151" }}
            />
            <Radar
              dataKey="score"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ fill: "#3B82F6", r: 4 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Scores par dimension */}
      <div className="mt-4 space-y-2">
        {sorted.map((dim) => (
          <div key={dim} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: DIMENSION_COLORS[dim] }}
              />
              <span className="text-xs text-gray-600">
                {DIMENSION_LABELS[dim]}
              </span>
            </div>
            <span
              className="text-xs font-bold"
              style={{ color: DIMENSION_COLORS[dim] }}
            >
              {scores[dim] > 0 ? scores[dim].toFixed(1) : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}