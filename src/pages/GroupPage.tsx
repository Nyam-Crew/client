import { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroupFindTab from '@/components/group/GroupFindTab';
import MyGroupsTab from '@/components/group/MyGroupsTab';
import GroupRankingTab from '@/components/group/GroupRankingTab';
import TeamDetailPage from '@/components/group/TeamDetailPage';
import CreateGroupPage from '@/components/group/CreateGroupPage';

const GroupPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL에서 탭 상태 추출
  const getActiveTab = () => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'mine' || tab === 'rank') return tab;
    return 'find';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/api/teams?tab=${value}`);
  };

  return (
    <Routes>
      <Route path="/create" element={<CreateGroupPage />} />
      <Route path="/:teamId/*" element={<TeamDetailPage />} />
      <Route path="/" element={
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">그룹</h1>
              <p className="text-muted-foreground">함께하는 건강한 라이프스타일</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="find">그룹찾기</TabsTrigger>
                <TabsTrigger value="mine">내 그룹</TabsTrigger>
                <TabsTrigger value="rank">그룹 랭킹</TabsTrigger>
              </TabsList>

              <TabsContent value="find" className="mt-0">
                <GroupFindTab />
              </TabsContent>

              <TabsContent value="mine" className="mt-0">
                <MyGroupsTab />
              </TabsContent>

              <TabsContent value="rank" className="mt-0">
                <GroupRankingTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      } />
    </Routes>
  );
};

export default GroupPage;