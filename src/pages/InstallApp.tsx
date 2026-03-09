import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Share } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InstallApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detectar se já está instalado
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isInStandaloneMode);

    // Capturar evento de instalação (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <Download className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">App Instalado!</CardTitle>
            <CardDescription>
              O aplicativo já está instalado no seu dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')} className="w-full">
              Acessar Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl mb-2">Instale o App</CardTitle>
          <CardDescription className="text-base">
            Tenha acesso rápido ao sistema financeiro direto da sua tela inicial
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Botão de instalação para Android/Chrome */}
          {isInstallable && !isIOS && (
            <div className="space-y-4">
              <Button 
                onClick={handleInstallClick} 
                className="w-full h-14 text-lg"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Instalar Aplicativo
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Clique no botão acima para instalar o app no seu dispositivo
              </p>
            </div>
          )}

          {/* Instruções para iOS */}
          {isIOS && (
            <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Share className="h-5 w-5" />
                Instruções para iPhone/iPad
              </h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Toque no botão <strong>Compartilhar</strong> (ícone de compartilhamento) na barra inferior do Safari</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Toque em <strong>"Adicionar"</strong> no canto superior direito</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>O app aparecerá na sua tela inicial</span>
                </li>
              </ol>
            </div>
          )}

          {/* Instruções para Android/Chrome */}
          {!isInstallable && !isIOS && (
            <div className="space-y-4 bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Instruções para Android
              </h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Toque no menu (⋮) no canto superior direito do Chrome</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Selecione <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Confirme tocando em <strong>"Instalar"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>O app aparecerá na sua tela inicial e gaveta de aplicativos</span>
                </li>
              </ol>
            </div>
          )}

          {/* Benefícios */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-lg mb-4">✨ Benefícios do App</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Acesso rápido:</strong> Abra direto da tela inicial</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Funciona offline:</strong> Consulte dados sem internet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Experiência nativa:</strong> Tela cheia, sem barra do navegador</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Atualizações automáticas:</strong> Sempre a versão mais recente</span>
              </li>
            </ul>
          </div>

          <Button 
            variant="outline" 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            Continuar no Navegador
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallApp;
