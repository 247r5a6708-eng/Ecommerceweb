
import React from 'react';
import { motion } from 'motion/react';
import { Database } from 'lucide-react';

export default function Placeholder({ title }: { title: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full min-h-[60vh]">
      <Database className="w-16 h-16 text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500">No data available yet.</p>
      <p className="text-sm text-gray-400 mt-2 text-center max-w-md">This module is connected to the database but currently holds no records. Create records in the application to populate this view.</p>
    </motion.div>
  );
}
