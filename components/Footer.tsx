import { styles } from '@/lib/design-system';

export default function Footer() {
  return (
    <footer className={`${styles.bgCard} border-t ${styles.border} mt-auto`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className={styles.textSecondary}>
            <p className="text-sm">
              Warhammer 40K Reading Tracker - Track your journey through the grim darkness
            </p>
          </div>
          <div className={`text-sm ${styles.textMuted}`}>
            Built with Next.js & Supabase
          </div>
        </div>
      </div>
    </footer>
  );
}
