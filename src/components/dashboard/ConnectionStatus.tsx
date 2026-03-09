import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdated: string | null;
}

export const ConnectionStatus = ({ isConnected, lastUpdated }: ConnectionStatusProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    // Mostrar animação de refresh por 1 segundo quando lastUpdated muda
    if (lastUpdated) {
      setIsRefreshing(true);
      const timer = setTimeout(() => setIsRefreshing(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdated]);

  const formatLastUpdated = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `Há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {isConnected ? (
        <>
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 text-primary animate-spin" />
          ) : (
            <Wifi className="h-4 w-4 text-green-500" />
          )}
          <span className="text-muted-foreground">
            {isRefreshing ? 'Atualizando...' : `Atualizado: ${formatLastUpdated(lastUpdated)}`}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-muted-foreground">Desconectado</span>
        </>
      )}
    </div>
  );
};
