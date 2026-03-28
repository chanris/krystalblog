import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { File, Download, Folder } from "lucide-react";
import { driveApi } from "../services/api";

export default function Drive() {
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrive();
  }, []);

  const loadDrive = async () => {
    try {
      const [filesRes, foldersRes] = await Promise.all([
        driveApi.files(),
        driveApi.folders()
      ]);
      setFiles(filesRes.data);
      setFolders(foldersRes.data);
    } catch (error) {
      console.error('加载网盘失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="mb-6" style={{ color: "#1c1917" }}>网盘</h1>

      {folders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg mb-3" style={{ color: "#1c1917" }}>文件夹</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {folders.map((folder) => (
              <motion.div
                key={folder.id}
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl cursor-pointer"
                style={{ background: "white", boxShadow: "0 2px 8px rgba(120,80,20,0.06)" }}
              >
                <Folder size={32} style={{ color: "#d97706" }} className="mb-2" />
                <p className="text-sm truncate" style={{ color: "#1c1917" }}>{folder.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg mb-3" style={{ color: "#1c1917" }}>文件</h2>
        <div className="space-y-2">
          {files.map((file) => (
            <motion.div
              key={file.id}
              whileHover={{ x: 4 }}
              className="p-4 rounded-xl flex items-center justify-between"
              style={{ background: "white", boxShadow: "0 2px 8px rgba(120,80,20,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <File size={20} style={{ color: "#78716c" }} />
                <div>
                  <p className="text-sm" style={{ color: "#1c1917" }}>{file.fileName}</p>
                  <p className="text-xs" style={{ color: "#a8956b" }}>{(file.fileSize / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <Download size={18} style={{ color: "#d97706" }} className="cursor-pointer" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
