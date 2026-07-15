import { useState, useMemo, ReactNode } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

/**
 * DataTable — bảng dữ liệu tái dùng cho toàn bộ Admin Dashboard.
 * Hỗ trợ: sắp xếp theo cột, tìm kiếm (filter), phân trang.
 *
 * Generic theo <T> để dùng cho mọi loại dữ liệu (users, campaigns, audit logs...).
 */

export interface Column<T> {
  /** khóa định danh cột (để track sort) */
  key: string;
  /** tiêu đề hiển thị */
  header: string;
  /** render nội dung ô từ 1 dòng dữ liệu */
  render: (row: T) => ReactNode;
  /** giá trị dùng để sort/search (mặc định không sort được nếu bỏ trống) */
  accessor?: (row: T) => string | number;
  /** cho phép sắp xếp cột này */
  sortable?: boolean;
  /** căn phải (cho cột số/thao tác) */
  align?: "left" | "right";
  /** class thêm cho <td> */
  cellClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  /** hàm trả key duy nhất cho mỗi dòng */
  rowKey: (row: T) => string;
  /** bật ô tìm kiếm */
  searchable?: boolean;
  /** placeholder ô tìm kiếm */
  searchPlaceholder?: string;
  /** số dòng mỗi trang (mặc định 10) */
  pageSize?: number;
  /** thông báo khi không có dữ liệu */
  emptyMessage?: string;
}

export default function DataTable<T>({
  data,
  columns,
  rowKey,
  searchable = true,
  searchPlaceholder = "Tìm kiếm...",
  pageSize = 10,
  emptyMessage = "Không có dữ liệu.",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // map key -> column để tra accessor khi sort
  const colByKey = useMemo(() => {
    const m: Record<string, Column<T>> = {};
    for (const c of columns) m[c.key] = c;
    return m;
  }, [columns]);

  // 1. Lọc theo query (dựa trên mọi accessor có sẵn)
  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.trim().toLowerCase();
    const accessors = columns.filter((c) => c.accessor).map((c) => c.accessor!);
    return data.filter((row) =>
      accessors.some((acc) => String(acc(row)).toLowerCase().includes(q))
    );
  }, [data, query, columns]);

  // 2. Sắp xếp
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const acc = colByKey[sortKey]?.accessor;
    if (!acc) return filtered;
    const arr = [...filtered].sort((a, b) => {
      const va = acc(a);
      const vb = acc(b);
      if (typeof va === "number" && typeof vb === "number") return va - vb;
      return String(va).localeCompare(String(vb), "vi");
    });
    return sortDir === "desc" ? arr.reverse() : arr;
  }, [filtered, sortKey, sortDir, colByKey]);

  // 3. Phân trang
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sorted, safePage, pageSize]
  );

  const handleSort = (col: Column<T>) => {
    if (!col.sortable || !col.accessor) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
    setPage(1);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Thanh tìm kiếm */}
      {searchable && (
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>
        </div>
      )}

      {/* Bảng */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        {paged.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">{emptyMessage}</div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="text-slate-500">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col)}
                    className={`px-4 py-3 font-semibold select-none ${
                      col.align === "right" ? "text-right" : ""
                    } ${col.sortable && col.accessor ? "cursor-pointer hover:text-slate-700" : ""}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && col.accessor && sortKey === col.key && (
                        sortDir === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr key={rowKey(row)} className="border-t border-slate-100 hover:bg-slate-50">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""} ${
                        col.cellClassName || ""
                      }`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Phân trang */}
      {sorted.length > pageSize && (
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} / {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-600 px-2">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
