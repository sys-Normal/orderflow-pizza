import { Fragment } from "react";
import Link from "next/link";
import { LogIn, MapPin, Pizza, ShoppingCart } from "lucide-react";

// Icon depiction of the ordering flow described in the subtitle below.
const FLOW_STEPS = [
  { Icon: MapPin, name: "explore" },
  { Icon: ShoppingCart, name: "cart" },
  { Icon: LogIn, name: "login" },
  { Icon: Pizza, name: "order" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">OrderFlow Pizza</h1>
      <div className="flex items-center gap-3" aria-hidden="true">
        {FLOW_STEPS.map(({ Icon, name }, index) => (
          <Fragment key={name}>
            {index > 0 && (
              <span className="h-px w-5 bg-black/[.1] dark:bg-white/[.15]" />
            )}
            <span
              className="flow-icon"
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              <Icon className="h-6 w-6" />
            </span>
          </Fragment>
        ))}
      </div>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        매장 탐색과 장바구니는 자유롭게, 주문할 때만 로그인하면 되는 피자 주문 플랫폼입니다.
      </p>
      <Link
        href="/stores"
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--primary),black_14%)] active:bg-[color-mix(in_oklab,var(--primary),black_24%)]"
      >
        매장찾기
      </Link>
      <Link
        href="/admin/login"
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        판매자·관리자 로그인
      </Link>
    </div>
  );
}
