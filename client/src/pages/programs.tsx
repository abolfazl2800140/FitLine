import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgramCard, ProgramCardSkeleton } from "@/components/ui/program-card";
import { translations } from "@/lib/persian";
import { Search, Dumbbell } from "lucide-react";

const difficulties = [
  { value: "all", label: "همه" },
  { value: "beginner", label: translations.programs.difficulty.beginner },
  { value: "intermediate", label: translations.programs.difficulty.intermediate },
  { value: "advanced", label: translations.programs.difficulty.advanced },
  { value: "expert", label: translations.programs.difficulty.expert },
];

export default function ProgramsPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [tab, setTab] = useState("all");

  const { data: allPrograms, isLoading } = useQuery<any[]>({
    queryKey: ["/api/programs"],
  });

  const { data: myPrograms, isLoading: myProgramsLoading } = useQuery<any[]>({
    queryKey: ["/api/user/programs"],
  });

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const filterPrograms = (programs: any[] | undefined) => {
    if (!programs) return [];
    return programs.filter((program: any) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesTitle = program.title?.toLowerCase().includes(searchLower);
        const matchesCoach = program.coach?.fullName?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesCoach) return false;
      }
      if (difficulty !== "all" && program.difficulty !== difficulty) return false;
      return true;
    });
  };

  const filteredAllPrograms = filterPrograms(allPrograms);
  const filteredMyPrograms = filterPrograms(myPrograms);

  return (
    <div className="container px-4 md:px-6 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{translations.programs.title}</h1>
        <p className="text-muted-foreground">
          برنامه‌های تمرینی حرفه‌ای از بهترین مربیان
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجوی برنامه..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
            data-testid="input-search-programs"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {difficulties.map((d) => (
            <Badge
              key={d.value}
              variant={difficulty === d.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setDifficulty(d.value)}
              data-testid={`badge-difficulty-${d.value}`}
            >
              {d.label}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="all" data-testid="tab-all-programs">
            {translations.programs.allPrograms}
          </TabsTrigger>
          <TabsTrigger value="my" data-testid="tab-my-programs">
            {translations.programs.myPrograms}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ProgramCardSkeleton key={i} />
              ))
            ) : filteredAllPrograms.length > 0 ? (
              filteredAllPrograms.map((program: any) => (
                <ProgramCard
                  key={program.id}
                  id={program.id}
                  title={program.title}
                  coachName={program.coach?.fullName || "مربی"}
                  coachAvatar={program.coach?.avatar}
                  coverImage={program.coverImage}
                  difficulty={program.difficulty || "beginner"}
                  durationWeeks={program.durationWeeks}
                  price={program.price}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">برنامه‌ای یافت نشد</h3>
                <p className="text-muted-foreground mb-4">
                  با تغییر فیلترها دوباره جستجو کنید
                </p>
                <Button variant="outline" onClick={() => { setSearch(""); setDifficulty("all"); }}>
                  پاک کردن فیلترها
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my">
          {!currentUser ? (
            <div className="text-center py-16">
              <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">ابتدا وارد شوید</h3>
              <p className="text-muted-foreground mb-4">
                برای مشاهده برنامه‌های خود، ابتدا وارد حساب کاربری شوید
              </p>
              <Button>{translations.auth.login}</Button>
            </div>
          ) : myProgramsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ProgramCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredMyPrograms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMyPrograms.map((enrollment: any) => (
                <ProgramCard
                  key={enrollment.id}
                  id={enrollment.program?.id || enrollment.programId}
                  title={enrollment.program?.title || "برنامه"}
                  coachName={enrollment.program?.coach?.fullName || "مربی"}
                  coachAvatar={enrollment.program?.coach?.avatar}
                  coverImage={enrollment.program?.coverImage}
                  difficulty={enrollment.program?.difficulty || "beginner"}
                  durationWeeks={enrollment.program?.durationWeeks || 0}
                  progress={parseFloat(enrollment.progress) || 0}
                  isEnrolled={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">برنامه‌ای ندارید</h3>
              <p className="text-muted-foreground mb-4">
                هنوز در هیچ برنامه‌ای ثبت‌نام نکرده‌اید
              </p>
              <Button onClick={() => setTab("all")}>
                مشاهده برنامه‌ها
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
