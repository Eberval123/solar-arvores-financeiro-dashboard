import { Link, NavLink, useLocation } from "react-router-dom";
import { Building2, LayoutDashboard, Upload, FileText, Menu, X, LogOut, User, Smartphone, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const { isAuthenticated, user, signOut, isAdmin, canAccessPrestacaoContas } = useSupabaseAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showInstallOption, setShowInstallOption] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    // Show install option only on mobile and if not installed
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setShowInstallOption(isMobile && !isInstalled);
  }, []);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você saiu do sistema com sucesso."
    });
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ...(isAuthenticated && canAccessPrestacaoContas ? [{ name: 'Prestação de Contas', href: '/prestacao-contas', icon: FileText }] : []),
    ...(isAuthenticated && isAdmin ? [
      { name: 'Gerenciar Dados', href: '/admin/data-management', icon: Upload },
      { name: 'Gestão de Acessos', href: '/admin/gestao-acessos', icon: Users }
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-sm border-r border-gray-200 pt-5 pb-4 overflow-y-auto shadow-lg">
          <div className="flex items-center flex-shrink-0 px-6">
            <Link to="/" className="flex items-center">
              <div className="w-12 h-12 bg-emerald-800 rounded-sm flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-800">Condomínio</h1>
                <p className="text-sm text-gray-600">Solar das Árvores</p>
              </div>
            </Link>
          </div>

          <nav className="mt-8 flex-1 px-4 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-sm transition-all duration-300 hover:translate-x-1",
                    isActive
                      ? "bg-emerald-800 text-white shadow-md"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        "mr-3 flex-shrink-0 h-5 w-5",
                        isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                      )}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {isAuthenticated && (
            <div className="flex-shrink-0 border-t border-gray-200 p-4 space-y-3">
              <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'Administrador' : 'Morador'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <Button
                  variant="ghost"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </Button>
              </div>

              <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <Link to="/" className="flex items-center">
                    <div className="w-10 h-10 bg-emerald-800 rounded-sm flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h1 className="text-base font-bold text-gray-800">Condomínio</h1>
                      <p className="text-xs text-gray-600">Solar das Árvores</p>
                    </div>
                  </Link>
                </div>

                <nav className="mt-8 px-2 space-y-1">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center px-3 py-3 text-base font-medium rounded-sm transition-all duration-300 hover:translate-x-1",
                          isActive
                            ? "bg-emerald-800 text-white shadow-md"
                            : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-900"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={cn(
                              "mr-4 flex-shrink-0 h-6 w-6",
                              isActive ? "text-white" : "text-gray-400"
                            )}
                          />
                          {item.name}
                        </>
                      )}
                    </NavLink>
                  ))}

                  {/* Install App Option - Only on mobile */}
                  {showInstallOption && (
                    <Link
                      to="/install"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center px-3 py-3 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      <Smartphone className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400" />
                      Instalar App
                    </Link>
                  )}
                </nav>
              </div>

              {isAuthenticated && (
                <div className="flex-shrink-0 border-t border-gray-200 p-4 space-y-3">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isAdmin ? 'Administrador' : 'Morador'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-sm shadow-sm lg:hidden">
          <Button
            variant="ghost"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex-1 flex items-center justify-center px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-emerald-800 rounded-sm flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="ml-2">
                <h1 className="text-sm font-semibold text-gray-800">Solar das Árvores</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center pr-4">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 text-gray-500" />
              </Button>
            )}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
