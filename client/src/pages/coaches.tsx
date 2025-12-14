import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { CoachCard, CoachCardSkeleton } from "@/components/ui/coach-card";
import { translations } from "@/lib/persian";
import { Search, SlidersHorizontal, X, Users } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const specialties = [
  { value: "all", label: translations.coaches.filters.all },
  { value: "بدنسازی", label: translations.coaches.filters.bodybuilding },
  { value: "کاهش وزن", label: translations.coaches.filters.weightLoss },
  { value: "فیتنس بانوان", label: translations.coaches.filters.fitness },
  { value: "کراس‌فیت", label: translations.coaches.filters.crossfit },
  { value: "یوگا", label: translations.coaches.filters.yoga },
  { value: "تغذیه", label: translations.coaches.filters.nutrition },
];

const genders = [
  { value: "all", label: translations.coaches.filters.all },
  { value: "male", label: translations.coaches.filters.male },
  { value: "female", label: translations.coaches.filters.female },
];

export default function CoachesPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [gender, setGender] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: coaches, isLoading } = useQuery<any[]>({
    queryKey: ["/api/coaches"],
  });

  const activeFiltersCount = [
    specialty !== "all",
    gender !== "all",
    priceRange[0] > 0 || priceRange[1] < 2000000,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSpecialty("all");
    setGender("all");
    setPriceRange([0, 2000000]);
  };

  const filteredCoaches = coaches?.filter((coach: any) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesName = coach.user?.fullName?.toLowerCase().includes(searchLower);
      const matchesSpecialty = coach.specialty?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesSpecialty) return false;
    }

    if (specialty !== "all" && coach.specialty !== specialty) return false;
    if (gender !== "all" && coach.user?.gender !== gender) return false;

    const price = parseFloat(coach.pricePerSession);
    if (price < priceRange[0] || price > priceRange[1]) return false;

    return true;
  }) || [];

  return (
    <div>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
        <div className="container px-4 md:px-6 h-14 flex items-center justify-center">
          <span className="text-lg italic font-semibold text-primary-foreground">FitLine</span>
        </div>
      </div>
      {/* Spacer for fixed header */}
      <div className="h-14" />

      <div className="container px-4 md:px-6 py-6">

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجوی مربی..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
              data-testid="input-search-coaches"
            />
          </div>

          <div className="flex gap-2">
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="w-[140px]" data-testid="select-specialty">
                <SelectValue placeholder={translations.coaches.specialty} />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="w-[120px]" data-testid="select-gender">
                <SelectValue placeholder="جنسیت" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-filters">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">فیلترها</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="mr-1 h-5 w-5 p-0 flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    فیلترها
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        پاک کردن
                      </Button>
                    )}
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  <div className="space-y-3">
                    <Label>تخصص</Label>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((s) => (
                        <Badge
                          key={s.value}
                          variant={specialty === s.value ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setSpecialty(s.value)}
                        >
                          {s.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>جنسیت</Label>
                    <div className="flex flex-wrap gap-2">
                      {genders.map((g) => (
                        <Badge
                          key={g.value}
                          variant={gender === g.value ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setGender(g.value)}
                        >
                          {g.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>محدوده قیمت (تومان)</Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={2000000}
                      step={50000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{priceRange[0].toLocaleString("fa-IR")}</span>
                      <span>{priceRange[1].toLocaleString("fa-IR")}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setFiltersOpen(false)}
                  >
                    اعمال فیلترها
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">فیلترهای فعال:</span>
            {specialty !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {specialties.find(s => s.value === specialty)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSpecialty("all")}
                />
              </Badge>
            )}
            {gender !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {genders.find(g => g.value === gender)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setGender("all")}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              پاک کردن همه
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <CoachCardSkeleton key={i} />
            ))
          ) : filteredCoaches.length > 0 ? (
            filteredCoaches.map((coach: any) => (
              <CoachCard
                key={coach.id}
                id={coach.id}
                name={coach.user?.fullName || "مربی"}
                avatar={coach.user?.avatar}
                specialty={coach.specialty}
                experience={coach.experience}
                pricePerSession={coach.pricePerSession}
                rating={coach.rating}
                reviewCount={coach.reviewCount || 0}
                clientCount={coach.clientCount || 0}
                isVerified={coach.isVerified}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">مربی‌ای یافت نشد</h3>
              <p className="text-muted-foreground mb-4">
                با تغییر فیلترها دوباره جستجو کنید
              </p>
              <Button variant="outline" onClick={clearFilters}>
                پاک کردن فیلترها
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
