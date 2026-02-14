"use client";

import React from "react";
import { motion } from "framer-motion";

export const DiscoveryGraphic = () => (
  <div className="relative w-full aspect-square flex items-center justify-center p-8">
    <svg viewBox="0 0 400 400" className="w-full h-full text-gold">
      {/* Grid Mesh */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.1"
          />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#grid)" />

      {[
        { x: 120, y: 140 },
        { x: 280, y: 160 },
        { x: 150, y: 280 },
        { x: 250, y: 220 },
        { x: 100, y: 200 },
        { x: 300, y: 120 },
      ].map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r="4"
          fill="currentColor"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
        />
      ))}

      {/* Scanning Focal Point */}
      <motion.g
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -50, 100, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle
          cx="200"
          cy="200"
          r="60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="5 5"
          className="opacity-40"
        />
        <circle
          cx="200"
          cy="200"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-60"
        />
        <motion.circle
          cx="200"
          cy="200"
          r="4"
          fill="currentColor"
          animate={{ r: [4, 8, 4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <line
          x1="200"
          y1="140"
          x2="200"
          y2="260"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        <line
          x1="140"
          y1="200"
          x2="260"
          y2="200"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
      </motion.g>
    </svg>
    <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full" />
  </div>
);

export const ProtocolGateGraphic = () => (
  <div className="relative w-full aspect-square flex items-center justify-center p-8">
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Outer Ring */}
      <circle
        cx="200"
        cy="200"
        r="140"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="0.5"
        strokeDasharray="10 5"
        className="opacity-20"
      />

      {/* The "Bridge" */}
      <rect
        x="120"
        y="180"
        width="160"
        height="40"
        rx="4"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1"
        className="opacity-40"
      />

      {/* Payment Packets */}
      <motion.rect
        x="130"
        y="195"
        width="10"
        height="10"
        rx="1"
        fill="#f59e0b"
        animate={{ x: [130, 260] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Gated Core */}
      <motion.g
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <path
          d="M180 160 L220 160 L220 240 L180 240 Z"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <motion.path
          d="M190 200 L210 200"
          stroke="#f59e0b"
          strokeWidth="4"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.g>

      {/* Connection Lines */}
      <line
        x1="120"
        y1="200"
        x2="60"
        y2="200"
        stroke="#f59e0b"
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />
      <line
        x1="280"
        y1="200"
        x2="340"
        y2="200"
        stroke="#f59e0b"
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />
    </svg>
    <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full" />
  </div>
);

export const IngestionGraphic = () => (
  <div className="relative w-full aspect-square flex items-center justify-center p-8">
    <svg viewBox="0 0 400 400" className="w-full h-full text-gold">
      {/* Neural Core */}
      <motion.circle
        cx="200"
        cy="200"
        r="60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        animate={{ r: [60, 70, 60], strokeOpacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <circle
        cx="200"
        cy="200"
        r="30"
        fill="currentColor"
        className="opacity-20"
      />
      <circle cx="200" cy="200" r="10" fill="currentColor" />

      {/* Data Inflow Particles */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.g key={i} rotate={angle}>
          <motion.circle
            cx="200"
            cy="100"
            r="2"
            fill="currentColor"
            animate={{ cy: [100, 180], opacity: [0, 1, 0] }}
            transition={{
              duration: 2,
              delay: i * 0.25,
              repeat: Infinity,
              ease: "easeIn",
            }}
          />
        </motion.g>
      ))}

      {/* Orbiting Skills */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <rect
          x="300"
          y="190"
          width="20"
          height="20"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <rect
          x="80"
          y="190"
          width="20"
          height="20"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      </motion.g>
    </svg>
    <div className="absolute inset-0 bg-gold/10 blur-[100px] rounded-full" />
  </div>
);
