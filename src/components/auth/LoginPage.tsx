import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, Lock, Smartphone, UserPlus } from 'lucide-react';
import { useSignupForm, SignupFormData } from '@/hooks/useSignupForm';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tiles } from '@/components/ui/tiles';
const APARTAMENTOS = ['101', '102', '201', '202', '301', '302', '401', '402', '501', '502'];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const { signIn, signUp, isAuthenticated } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const signupForm = useSignupForm();

  useEffect(() => {
    // Check if app is not installed and user is on mobile
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setShowInstallBanner(isMobile && !isInstalled);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema."
      });
      navigate('/');
    }
  };

  const handleSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);

    const { error } = await signUp(data.email, data.password, {
      nome: data.nome,
      telefone: data.telefone,
      apartamento: data.apartamento,
    });

    if (error) {
      let errorMessage = error.message;

      if (error.message.includes('already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message.includes('email')) {
        errorMessage = 'Email inválido ou já em uso.';
      }

      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive"
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Aguarde a aprovação do administrador para acessar o sistema.",
        duration: 5000,
      });
      signupForm.reset();
      setIsSignupMode(false);
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4">
      {/* Background Tiles */}
      <div className="absolute inset-0 z-0">
        <Tiles rows={50} cols={15} tileSize="md" />
      </div>
      {/* Install Banner */}
      {showInstallBanner && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-2 px-4 z-50 shadow-lg">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Smartphone className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs font-medium truncate">Instale o app para acesso rápido</p>
            </div>
            <Link to="/install">
              <Button variant="secondary" size="sm" className="text-xs h-7 px-3 flex-shrink-0">
                Instalar
              </Button>
            </Link>
          </div>
        </div>
      )}

      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            {isSignupMode ? (
              <UserPlus className="w-8 h-8 text-white" />
            ) : (
              <Building2 className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
              {isSignupMode ? 'Criar Conta' : 'Acesso ao Sistema'}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Condomínio Solar das Árvores
            </CardDescription>
          </div>

          {/* Tabs para alternar entre Login e Cadastro */}
          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              variant={!isSignupMode ? 'default' : 'outline'}
              className={!isSignupMode ? 'flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white' : 'flex-1'}
              onClick={() => setIsSignupMode(false)}
            >
              Login
            </Button>
            <Button
              type="button"
              variant={isSignupMode ? 'default' : 'outline'}
              className={isSignupMode ? 'flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white' : 'flex-1'}
              onClick={() => setIsSignupMode(true)}
            >
              Cadastro
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {!isSignupMode ? (
            // Formulário de Login
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu email..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha..."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-2.5"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar no Sistema"}
              </Button>
            </form>
          ) : (
            // Formulário de Cadastro
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone <span className="text-xs text-muted-foreground font-normal">(Opcional)</span></FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(11) 99999-9999"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={15}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="apartamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apartamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione seu apartamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {APARTAMENTOS.map((apt) => (
                            <SelectItem key={apt} value={apt}>
                              Apartamento {apt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Digite a senha novamente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-medium py-2.5 rounded-sm hover:-translate-y-0.5 transition-all"
                  disabled={isLoading || !signupForm.formState.isValid}
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              {isSignupMode
                ? 'Após o cadastro, aguarde aprovação do administrador'
                : 'Entre com suas credenciais de acesso'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default LoginPage;