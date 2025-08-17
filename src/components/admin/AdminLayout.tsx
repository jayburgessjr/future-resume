import { Card } from '@/components/ui/card';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export const AdminLayout = ({ children, title, description }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          </div>
          {description && (
            <p className="text-muted-foreground text-lg">{description}</p>
          )}
        </div>
        
        <Card className="p-6">
          {children}
        </Card>
      </div>
    </div>
  );
};