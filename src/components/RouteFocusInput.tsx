// src/components/RouteFocusInput.tsx
import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  /** เส้นทางที่ต้องการให้โฟกัสอัตโนมัติ เช่น ["/", "/pokedex"] */
  focusPaths: string[];
  /** หลังโฟกัส เลื่อน caret ไปท้ายหรือไม่ (ค่าเริ่มต้น: true) */
  caretToEnd?: boolean;
};

export default function RouteFocusInput({
  focusPaths,
  caretToEnd = true,
  ...rest
}: Props) {
  const ref = useRef<HTMLInputElement | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!focusPaths.includes(pathname)) return;
    const el = ref.current;
    if (!el) return;

    el.focus();

    if (caretToEnd) {
      try {
        const len = el.value.length;
        el.setSelectionRange(len, len);
      } catch {
        // บราวเซอร์บางตัว/สถานะบางจังหวะอาจไม่รองรับ setSelectionRange
        /* no-op */
      }
    }
  }, [pathname, focusPaths, caretToEnd]);

  return <input ref={ref} {...rest} />;
}
