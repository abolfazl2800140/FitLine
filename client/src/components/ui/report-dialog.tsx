import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Flag } from "lucide-react";

const reportReasons = [
  { value: "spam", label: "اسپم یا تبلیغات" },
  { value: "inappropriate", label: "محتوای نامناسب" },
  { value: "harassment", label: "آزار و اذیت" },
  { value: "misinformation", label: "اطلاعات نادرست" },
  { value: "other", label: "سایر موارد" },
];

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemType: "post" | "comment" | "question" | "answer";
}

export function ReportDialog({ open, onOpenChange, itemId, itemType }: ReportDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const reportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/reports", {
        itemId,
        itemType,
        reason,
        description: description.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "گزارش ثبت شد",
        description: "از گزارش شما متشکریم. تیم ما بررسی خواهد کرد.",
      });
      onOpenChange(false);
      setReason("");
      setDescription("");
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "مشکلی در ثبت گزارش پیش آمد",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (reason) {
      reportMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            گزارش محتوا
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">دلیل گزارش</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
              {reportReasons.map((r) => (
                <div key={r.value} className="flex items-center gap-3">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="text-sm cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">توضیحات (اختیاری)</Label>
            <Textarea
              placeholder="توضیحات بیشتر..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || reportMutation.isPending}
            variant="destructive"
          >
            {reportMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : null}
            ثبت گزارش
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
