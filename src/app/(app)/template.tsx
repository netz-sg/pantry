import type { ReactNode } from 'react';

/** Bei jedem Seitenwechsel ein kurzes, ruhiges Einblenden als Antwort auf den Tipp. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-in">{children}</div>;
}
