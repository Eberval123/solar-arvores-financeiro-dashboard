import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, ShieldCheck, UserCheck, ShieldAlert, Loader2, CheckCircle2, User, Trash2 } from 'lucide-react';

type UserRole = 'admin' | 'morador' | 'fiscal';

interface Morador {
    id: string;
    user_id: string | null;
    nome: string;
    email: string;
    apartamento: string;
    telefone: string | null;
    created_at: string;
    role?: UserRole;
}

const GestaoAcessos = () => {
    const [moradores, setMoradores] = useState<Morador[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<Morador | null>(null);
    const { toast } = useToast();

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Buscar moradores
            const { data: moradoresData, error: moradoresError } = await supabase
                .from('moradores')
                .select('*')
                .order('created_at', { ascending: false });

            if (moradoresError) throw moradoresError;

            // 2. Buscar roles de todos os usuários autenticados
            const { data: rolesData, error: rolesError } = await supabase
                .from('user_roles')
                .select('user_id, role');

            if (rolesError) throw rolesError;

            // 3. Mesclar dados
            const combinedData = (moradoresData || []).map((m: any) => {
                const userRole = rolesData?.find(r => r.user_id === m.user_id);
                return {
                    ...m,
                    role: (userRole?.role as UserRole) || 'morador'
                };
            });

            setMoradores(combinedData);
        } catch (error: any) {
            console.error('Erro ao buscar dados de usuários:', error);
            toast({
                title: "Erro ao carregar dados",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateRole = async (morador: Morador, newRole: UserRole) => {
        if (!morador.user_id) {
            toast({
                title: "Usuário não vinculado",
                description: "Este morador ainda não possui uma conta vinculada.",
                variant: "destructive"
            });
            return;
        }

        try {
            setUpdatingId(morador.id);

            // Upsert na tabela user_roles
            const { error } = await supabase
                .from('user_roles')
                .upsert({
                    user_id: morador.user_id,
                    role: newRole
                }, { onConflict: 'user_id' });

            if (error) throw error;

            // Atualizar estado local
            setMoradores(prev => prev.map(m =>
                m.id === morador.id ? { ...m, role: newRole } : m
            ));

            toast({
                title: "Função atualizada",
                description: `O usuário agora é ${newRole === 'admin' ? 'Administrador' : newRole === 'fiscal' ? 'Conselho Fiscal' : 'Morador'}.`,
            });
        } catch (error: any) {
            console.error('Erro ao atualizar função:', error);
            toast({
                title: "Erro ao atualizar função",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            setUpdatingId(userToDelete.id);

            // 1. Remover da tabela user_roles se existir user_id
            if (userToDelete.user_id) {
                const { error: rolesError } = await supabase
                    .from('user_roles')
                    .delete()
                    .eq('user_id', userToDelete.user_id);

                if (rolesError) console.error('Erro ao remover roles:', rolesError);
            }

            // 2. Remover da tabela moradores
            const { error: moradorError } = await supabase
                .from('moradores')
                .delete()
                .eq('id', userToDelete.id);

            if (moradorError) throw moradorError;

            // 3. Atualizar estado local
            setMoradores(prev => prev.filter(m => m.id !== userToDelete.id));

            toast({
                title: "Usuário excluído",
                description: "O registro do morador foi removido com sucesso.",
            });
        } catch (error: any) {
            console.error('Erro ao excluir usuário:', error);
            toast({
                title: "Erro ao excluir usuário",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setUpdatingId(null);
            setUserToDelete(null);
        }
    };


    const getRoleBadge = (role?: UserRole) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-emerald-800 hover:bg-emerald-900 border-none px-3 py-1 gap-1"><ShieldAlert className="w-3 h-3" /> Admin</Badge>;
            case 'fiscal':
                return <Badge className="bg-blue-600 hover:bg-blue-700 border-none px-3 py-1 gap-1"><ShieldCheck className="w-3 h-3" /> Fiscal</Badge>;
            default:
                return <Badge variant="secondary" className="px-3 py-1 gap-1"><UserCheck className="w-3 h-3" /> Morador</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-4 lg:p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-emerald-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-emerald-800" />
                        Gestão de Acessos
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Controle quem pode acessar as áreas administrativas e fiscais do sistema.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchData}
                    disabled={loading}
                    className="border-emerald-200 hover:bg-emerald-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Loader2 className="w-4 h-4 mr-2" />}
                    Atualizar Lista
                </Button>
            </div>

            <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-emerald-800/5 border-b border-emerald-100">
                    <CardTitle className="text-lg font-semibold text-emerald-900">Usuários Cadastrados</CardTitle>
                    <CardDescription>Lista completa de moradores registrados no sistema.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 lg:p-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-emerald-50/50">
                                <TableRow>
                                    <TableHead className="font-bold text-emerald-900">Morador</TableHead>
                                    <TableHead className="font-bold text-emerald-900">Contato</TableHead>
                                    <TableHead className="font-bold text-emerald-900">Apto</TableHead>
                                    <TableHead className="font-bold text-emerald-900">Função Atual</TableHead>
                                    <TableHead className="font-bold text-emerald-900 text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-800" />
                                            <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : moradores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20">
                                            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                            <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    moradores.map((morador) => (
                                        <TableRow key={morador.id} className="hover:bg-emerald-50/30 transition-colors">
                                            <TableCell>
                                                <div className="font-medium text-gray-900">{morador.nome}</div>
                                                <div className="text-xs text-muted-foreground">{morador.email}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {morador.telefone || <span className="text-gray-400">N/A</span>}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono bg-white">
                                                    Apt {morador.apartamento}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getRoleBadge(morador.role)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Select
                                                        disabled={updatingId === morador.id || !morador.user_id}
                                                        defaultValue={morador.role}
                                                        onValueChange={(value) => handleUpdateRole(morador, value as UserRole)}
                                                    >
                                                        <SelectTrigger className="w-[160px] h-9 border-emerald-100 bg-white shadow-sm">
                                                            <SelectValue placeholder="Atribuir" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="morador">Morador Comum</SelectItem>
                                                            <SelectItem value="fiscal">Conselho Fiscal</SelectItem>
                                                            <SelectItem value="admin">Administrador</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={updatingId === morador.id}
                                                        onClick={() => setUserToDelete(morador)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0"
                                                        title="Excluir Usuário"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>

                                                    {!morador.user_id && (
                                                        <div className="text-[10px] text-amber-600 font-medium italic mt-1">
                                                            Pendente vínculo
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card className="border-l-4 border-l-emerald-800 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 rounded-full">
                                <ShieldAlert className="w-6 h-6 text-emerald-800" />
                            </div>
                            <div>
                                <h3 className="font-bold">Admin</h3>
                                <p className="text-xs text-muted-foreground">Acesso total ao sistema e gestão de dados.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-600 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <ShieldCheck className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold">Fiscal</h3>
                                <p className="text-xs text-muted-foreground">Acesso a prestação de contas e análises.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-gray-400 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-full">
                                <UserCheck className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">Morador</h3>
                                <p className="text-xs text-muted-foreground">Acesso ao Dashboard e botão de Análise Financeira.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <ShieldAlert className="w-5 h-5" />
                            Confirmar Exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir permanentemente o registro de <strong>{userToDelete?.nome}</strong>?
                            <br /><br />
                            Esta ação removerá o perfil e todas as permissões de acesso do usuário. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Excluir Registro
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default GestaoAcessos;
