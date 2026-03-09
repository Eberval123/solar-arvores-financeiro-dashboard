import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Share } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) return;

    // Check if user previously dismissed (allow showing again after 7 days)
    const dismissedDate = localStorage.getItem('pwa-install-dismissed-date');
    if (dismissedDate) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 10 seconds on first visit
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show prompt after delay
    if (iOS && !isInstalled) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed-date', Date.now().toString());
  };

  const handleLearnMore = () => {
    setShowPrompt(false);
    navigate('/install');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <Card className="shadow-lg border-2 border-primary bg-background">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                {isIOS ? <Share className="w-5 h-5 text-primary-foreground" /> : <Download className="w-5 h-5 text-primary-foreground" />}
              </div>
              <div>
                <CardTitle className="text-base">Instalar App</CardTitle>
                <CardDescription className="text-xs">
                  {isIOS ? 'Adicione à tela inicial' : 'Acesso rápido e offline'}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {!isIOS && deferredPrompt ? (
            <>
              <Button 
                onClick={handleInstallClick} 
                className="w-full"
                size="sm"
              >
                Instalar Agora
              </Button>
              <Button 
                variant="ghost" 
                className="w-full" 
                size="sm"
                onClick={handleDismiss}
              >
                Agora não
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleLearnMore} 
                className="w-full"
                size="sm"
              >
                Ver Instruções
              </Button>
              <Button 
                variant="ghost" 
                className="w-full" 
                size="sm"
                onClick={handleDismiss}
              >
                Agora não
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPrompt;
