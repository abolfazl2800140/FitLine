import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface PageHeaderProps {
  title?: string;
  showBack?: boolean;
  backPath?: string;
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  className?: string;
}

export const PageHeader = memo(function PageHeader({
  title = "FitLine",
  showBack = false,
  backPath,
  rightContent,
  leftContent,
  className,
}: PageHeaderProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (backPath) {
      setLocation(backPath);
    } else {
      window.history.back();
    }
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 bg-primary ${className || ""}`}>
        <div className="flex items-center justify-between px-4 h-14 relative">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-xl text-primary-foreground hover:bg-white/20 h-11 w-11"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          ) : rightContent ? (
            rightContent
          ) : (
            <div className="w-10" />
          )}
          
          <span className="text-lg italic font-semibold text-primary-foreground">
            {title}
          </span>
          
          {leftContent ? leftContent : <div className="w-10" />}
        </div>
      </div>
      {/* Spacer for fixed header */}
      <div className="h-14" />
    </>
  );
});
