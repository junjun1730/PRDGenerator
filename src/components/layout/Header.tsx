import Button from '@/components/ui/Button';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-soft">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Service Name */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-brand-600">
              AI PRD Generator
            </h1>
          </div>

          {/* Login Button - Placeholder for future auth */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" disabled>
              로그인 (준비중)
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
