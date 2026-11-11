import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** Link, usePathname, useRouter… conscients de la langue. */
export const { Link, usePathname, useRouter, getPathname } = createNavigation(routing);
