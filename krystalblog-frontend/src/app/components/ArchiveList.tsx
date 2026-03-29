import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, ChevronDown } from "lucide-react";
import { articleApi } from "../services/api";

interface ArchiveListProps {
  activeArchive: string | null;
  onArchiveChange: (archive: string | null) => void;
}

interface ArchiveData {
  archive: string;
  articles: Array<{ id: number; title: string; date: string }>;
}

export default function ArchiveList({ activeArchive, onArchiveChange }: ArchiveListProps) {
  const [archives, setArchives] = useState<ArchiveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set(["2026"]));

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    try {
      setLoading(true);
      const res: any = await articleApi.archives();
      setArchives(res.data || []);
    } catch (err) {
      console.error('加载归档失败:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const groupedByYear = archives.reduce((acc, item) => {
    const [year, month] = item.archive.split('-');
    if (!acc[year]) acc[year] = [];
    acc[year].push({ month, count: item.articles.length, archive: item.archive });
    return acc;
  }, {} as Record<string, Array<{ month: string; count: number; archive: string }>>);

  const toggleYear = (year: string) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

  if (loading) {
    return (
      <div className="rounded-2xl p-5" style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}>
        <h3 className="flex items-center gap-2 mb-3" style={{ color: "#1c1917" }}>
          <Calendar size={16} style={{ color: "#d97706" }} />
          归档
        </h3>
        <p className="text-xs" style={{ color: "#a8956b" }}>加载中...</p>
      </div>
    );
  }

  if (error || archives.length === 0) {
    return (
      <div className="rounded-2xl p-5" style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}>
        <h3 className="flex items-center gap-2 mb-3" style={{ color: "#1c1917" }}>
          <Calendar size={16} style={{ color: "#d97706" }} />
          归档
        </h3>
        <p className="text-xs" style={{ color: "#a8956b" }}>{error ? '加载失败' : '暂无归档'}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: "white", boxShadow: "0 2px 12px rgba(120,80,20,0.06)" }}>
      <h3 className="flex items-center gap-2 mb-3" style={{ color: "#1c1917" }}>
        <Calendar size={16} style={{ color: "#d97706" }} />
        归档
      </h3>
      <div className="space-y-2">
        {Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a)).map((year) => {
          const isExpanded = expandedYears.has(year);
          const yearTotal = groupedByYear[year].reduce((sum, m) => sum + m.count, 0);
          return (
            <div key={year}>
              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleYear(year)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                style={{ background: "#fef3c7", color: "#d97706" }}
              >
                <span className="font-medium">{year} 年</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#d97706", color: "white" }}>
                    {yearTotal}
                  </span>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} />
                  </motion.div>
                </div>
              </motion.button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-3 pt-1 space-y-1">
                      {groupedByYear[year].sort((a, b) => Number(b.month) - Number(a.month)).map((item) => {
                        const isActive = activeArchive === item.archive;
                        return (
                          <motion.button
                            key={item.archive}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onArchiveChange(isActive ? null : item.archive)}
                            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors"
                            style={{
                              background: isActive ? "#fef3c7" : "transparent",
                              color: isActive ? "#d97706" : "#78716c",
                            }}
                          >
                            <span>{monthNames[Number(item.month) - 1]}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: isActive ? "#d97706" : "#f5ede0", color: isActive ? "white" : "#a8956b" }}>
                              {item.count}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
