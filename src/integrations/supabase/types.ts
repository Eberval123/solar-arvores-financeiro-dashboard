export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      analises_financeiras: {
        Row: {
          conteudo: string
          created_at: string
          created_by: string | null
          data_criacao: string
          id: string
          nome_arquivo: string | null
          periodo: string
          tamanho_arquivo: number | null
          tipo_arquivo: string | null
          updated_at: string
          url_arquivo: string | null
        }
        Insert: {
          conteudo: string
          created_at?: string
          created_by?: string | null
          data_criacao?: string
          id?: string
          nome_arquivo?: string | null
          periodo: string
          tamanho_arquivo?: number | null
          tipo_arquivo?: string | null
          updated_at?: string
          url_arquivo?: string | null
        }
        Update: {
          conteudo?: string
          created_at?: string
          created_by?: string | null
          data_criacao?: string
          id?: string
          nome_arquivo?: string | null
          periodo?: string
          tamanho_arquivo?: number | null
          tipo_arquivo?: string | null
          updated_at?: string
          url_arquivo?: string | null
        }
        Relationships: []
      }
      aplicacoes_financeiras: {
        Row: {
          created_at: string
          created_by: string | null
          data_saldo: string
          id: string
          nome_aplicacao: string
          updated_at: string
          valor_aplicacao: number
          valor_rendimento: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_saldo: string
          id?: string
          nome_aplicacao: string
          updated_at?: string
          valor_aplicacao?: number
          valor_rendimento?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_saldo?: string
          id?: string
          nome_aplicacao?: string
          updated_at?: string
          valor_aplicacao?: number
          valor_rendimento?: number
        }
        Relationships: []
      }
      boletos: {
        Row: {
          apartamento: string
          bloco: string | null
          consumo_agua: number | null
          consumo_gas: number | null
          created_at: string | null
          created_by: string | null
          data_pagamento: string | null
          data_vencimento: string
          enviar_email: boolean | null
          fundo_reserva: number | null
          id: string
          mes_referencia: string
          pdf_url: string | null
          status: string | null
          taxa_condominio: number | null
          taxa_extra: number | null
          updated_at: string | null
          valor_total: number | null
        }
        Insert: {
          apartamento: string
          bloco?: string | null
          consumo_agua?: number | null
          consumo_gas?: number | null
          created_at?: string | null
          created_by?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          enviar_email?: boolean | null
          fundo_reserva?: number | null
          id?: string
          mes_referencia: string
          pdf_url?: string | null
          status?: string | null
          taxa_condominio?: number | null
          taxa_extra?: number | null
          updated_at?: string | null
          valor_total?: number | null
        }
        Update: {
          apartamento?: string
          bloco?: string | null
          consumo_agua?: number | null
          consumo_gas?: number | null
          created_at?: string | null
          created_by?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          enviar_email?: boolean | null
          fundo_reserva?: number | null
          id?: string
          mes_referencia?: string
          pdf_url?: string | null
          status?: string | null
          taxa_condominio?: number | null
          taxa_extra?: number | null
          updated_at?: string | null
          valor_total?: number | null
        }
        Relationships: []
      }
      duvidas_sindico: {
        Row: {
          apartamento: string
          bloco: string | null
          created_at: string
          created_by: string | null
          id: string
          morador_nome: string
          pergunta: string
          resposta: string | null
          status: string
          updated_at: string
        }
        Insert: {
          apartamento: string
          bloco?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          morador_nome: string
          pergunta: string
          resposta?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          apartamento?: string
          bloco?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          morador_nome?: string
          pergunta?: string
          resposta?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      extratos_bancarios: {
        Row: {
          ano_referencia: number
          created_at: string
          created_by: string | null
          id: string
          mes_referencia: number
          nome_arquivo: string
          tamanho_arquivo: number | null
          tipo_arquivo: string | null
          updated_at: string
          url_arquivo: string
        }
        Insert: {
          ano_referencia: number
          created_at?: string
          created_by?: string | null
          id?: string
          mes_referencia: number
          nome_arquivo: string
          tamanho_arquivo?: number | null
          tipo_arquivo?: string | null
          updated_at?: string
          url_arquivo: string
        }
        Update: {
          ano_referencia?: number
          created_at?: string
          created_by?: string | null
          id?: string
          mes_referencia?: number
          nome_arquivo?: string
          tamanho_arquivo?: number | null
          tipo_arquivo?: string | null
          updated_at?: string
          url_arquivo?: string
        }
        Relationships: []
      }
      moradores: {
        Row: {
          apartamento: string
          bloco: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          status: string
          telefone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          apartamento: string
          bloco?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          apartamento?: string
          bloco?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      prestacao_contas: {
        Row: {
          ano_referencia: number
          created_at: string
          created_by: string | null
          id: string
          mes_referencia: number
          nome_arquivo: string
          tamanho_arquivo: number | null
          tipo_arquivo: string | null
          updated_at: string
          url_arquivo: string
        }
        Insert: {
          ano_referencia: number
          created_at?: string
          created_by?: string | null
          id?: string
          mes_referencia: number
          nome_arquivo: string
          tamanho_arquivo?: number | null
          tipo_arquivo?: string | null
          updated_at?: string
          url_arquivo: string
        }
        Update: {
          ano_referencia?: number
          created_at?: string
          created_by?: string | null
          id?: string
          mes_referencia?: number
          nome_arquivo?: string
          tamanho_arquivo?: number | null
          tipo_arquivo?: string | null
          updated_at?: string
          url_arquivo?: string
        }
        Relationships: []
      }
      reservas: {
        Row: {
          apartamento: string
          bloco: string
          comprovante_pagamento_url: string | null
          created_at: string
          data_evento: string
          horario_fim: string | null
          horario_inicio: string
          id: string
          morador_nome: string
          observacoes: string | null
          quantidade_participantes: number
          status: string
          tipo_evento: string
          updated_at: string
        }
        Insert: {
          apartamento: string
          bloco: string
          comprovante_pagamento_url?: string | null
          created_at?: string
          data_evento: string
          horario_fim?: string | null
          horario_inicio: string
          id?: string
          morador_nome: string
          observacoes?: string | null
          quantidade_participantes: number
          status?: string
          tipo_evento: string
          updated_at?: string
        }
        Update: {
          apartamento?: string
          bloco?: string
          comprovante_pagamento_url?: string | null
          created_at?: string
          data_evento?: string
          horario_fim?: string | null
          horario_inicio?: string
          id?: string
          morador_nome?: string
          observacoes?: string | null
          quantidade_participantes?: number
          status?: string
          tipo_evento?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "morador" | "fiscal"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "morador", "fiscal"],
    },
  },
} as const
