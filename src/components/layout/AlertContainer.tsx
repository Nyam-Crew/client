// AlertContainer.tsx
import { useEffect, useState, useRef, type CSSProperties } from "react";
import dayjs from "dayjs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { defaultFetch } from "@/api/defaultFetch";

type TabKey = "general" | "team";

interface AlertItem {
  content: string;
  createdAt: string;
  isRead: boolean;
}

export function AlertContainer() {
  const [tab, setTab] = useState<TabKey>("general");
  const [general, setGeneral] = useState<AlertItem[]>([]);
  const [team, setTeam] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [needMore, setNeedMore] = useState<Record<number, boolean>>({});
  const contentRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const clamp2: CSSProperties = { display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' };

  // 탭 변경 시 해당 데이터만 로드
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        if (tab === "general" && general.length === 0) {
          const res: AlertItem[] = await defaultFetch("/api/notify/history?type=general");
          console.log("개인 History 불러오기 완료" + res);
          if (active) setGeneral(res ?? []);
        }
        if (tab === "team" && team.length === 0) {
          const res: AlertItem[] = await defaultFetch("/api/notify/history?type=team");
          if (active) setTeam(res ?? []);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // 접기 상태에서 내용이 2줄을 초과하는지 측정해 '더보기' 표시 여부 결정
  useEffect(() => {
    const measure = () => {
      const next: Record<number, boolean> = {};
      const currentItems = tab === "general" ? general : team;
      currentItems.slice(0, 20).forEach((_, i) => {
        const el = contentRefs.current[i];
        if (!el) return;
        // expanded가 아닌 상태(=클램프 적용)에서만 측정
        if (expanded[i]) {
          next[i] = true; // 펼쳐진 상태에서는 '접기' 버튼을 보여주기 위해 true로 둠
          return;
        }
        next[i] = el.scrollHeight > el.clientHeight + 1;
      });
      setNeedMore(next);
    };
    // 다음 페인팅 이후 계산
    const r = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(r);
      window.removeEventListener("resize", measure);
    };
  }, [tab, general, team, expanded]);

  const renderList = (items: AlertItem[]) => {
    if (loading) return <div className="p-6 text-sm text-muted-foreground">불러오는 중…</div>;
    if (items.length === 0) return <div className="p-6 text-sm text-muted-foreground">새로운 알림이 없습니다</div>;

    return (
        <div className="max-h-96 overflow-y-auto">
          {items.slice(0, 20).map((n, i) => {
            const dateStr = dayjs(n.createdAt).format("M월 D일 HH시 mm분");
            const isOpen = !!expanded[i];
            return (
              <div key={i} className="px-4 py-3 hover:bg-accent/40 flex items-start gap-2 overflow-visible">
                {!n.isRead && <span className="mt-1 ml-1 inline-block w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground break-words">
                    <div
                      ref={(el) => { contentRefs.current[i] = el; }}
                      className={isOpen ? "whitespace-pre-wrap" : ""}
                      style={isOpen ? undefined : clamp2}
                    >
                      {n.content}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{dateStr}</div>
                  {(needMore[i] || isOpen) && (
                    <button
                      className="mt-1 text-xs text-muted-foreground hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setExpanded((p) => ({ ...p, [i]: !p[i] }));
                      }}
                    >
                      {isOpen ? "접기" : "더보기"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
    );
  };

  return (
      <div className="w-80 rounded-xl border bg-card shadow-xl">
        {/* 헤더 + 탭 선택 */}
        <div className="p-3 border-b">
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="general">일반 알림</TabsTrigger>
              <TabsTrigger value="team">그룹 알림</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 탭별 내용 */}
        <Tabs value={tab}>
          <TabsContent value="general" className="m-0">
            {renderList(general)}
          </TabsContent>
          <TabsContent value="team" className="m-0">
            {renderList(team)}
          </TabsContent>
        </Tabs>
      </div>
  );
}