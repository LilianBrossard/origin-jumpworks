import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "./PageHeader";

/** Page provisoire pour les sections prévues aux étapes suivantes. */
export function Placeholder({ title }: { title: string }) {
  const t = useTranslations("placeholder");
  return (
    <div className="flex-1">
      <PageHeader eyebrow={t("eyebrow")} title={title} lead={t("lead")}>
        <div className="pt-4">
          <Button href="/" variant="ghost">
            {t("back")}
          </Button>
        </div>
      </PageHeader>
    </div>
  );
}
