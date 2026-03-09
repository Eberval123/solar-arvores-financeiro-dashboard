import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSignup } from '@/hooks/useSignup';
import { UserPlus, Mail, Home, User, Phone } from 'lucide-react';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal = ({ isOpen, onClose }: SignupModalProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    apartamento: '',
    email: '',
    telefone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signup } = useSignup();

  // Gerar opções de apartamento de 101 a 502
  const generateApartmentOptions = () => {
    const apartments = [];
    for (let floor = 1; floor <= 5; floor++) {
      for (let unit = 1; unit <= 2; unit++) {
        apartments.push(`${floor}0${unit}`);
      }
    }
    return apartments;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signup(formData);

      if (result.success) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Seu cadastro está em análise. Aguarde a aprovação do administrador.",
        });
        setFormData({ nome: '', apartamento: '', email: '', telefone: '' });
        onClose();
      } else {
        toast({
          title: "Erro no cadastro",
          description: result.error || "Ocorreu um erro ao realizar o cadastro.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.nome.trim() !== '' &&
    formData.apartamento !== '' &&
    formData.email.trim() !== '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <UserPlus className="w-6 h-6 text-green-500" />
            Novo Cadastro
          </DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pb-4">
            <CardDescription className="text-gray-600">
              Preencha os dados para solicitar acesso ao sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome do Morador *
                </Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                  className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartamento" className="text-gray-700 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Apartamento *
                </Label>
                <Select
                  value={formData.apartamento}
                  onValueChange={(value) => handleInputChange('apartamento', value)}
                  required
                >
                  <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Selecione o apartamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateApartmentOptions().map((apt) => (
                      <SelectItem key={apt} value={apt}>
                        Apartamento {apt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone (Opcional)
                </Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Após o cadastro, aguarde a aprovação do administrador para acessar o sistema
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;