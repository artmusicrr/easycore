# 📊 Resumo dos Dados Populados no Banco (Seed)

**Data de Execução:** 26 de dezembro de 2025

## ✅ Dados Criados com Sucesso

### 👥 Pacientes
- **Total:** 48 pacientes
- **Distribuição:** 8-12 pacientes por mês nos últimos 5 meses
- **Período:** Agosto/2025 a Dezembro/2025

### 💉 Tratamentos
- **Total:** 66 tratamentos
- **Variação:** 1-2 tratamentos por paciente
- **Valores:** R$ 500 a R$ 5.500 por tratamento
- **Tipos:** Canal, Limpeza, Implante, Aparelho, Restauração, Extração, etc.

### 💰 Pagamentos Realizados
- **Total:** 157 pagamentos registrados
- **Formas de pagamento:** PIX, Cartão de Crédito/Débito, Dinheiro, Boleto

#### 📅 Distribuição por Mês:
| Mês        | Pagamentos | Receita Total  |
|------------|-----------|----------------|
| Ago/2025   | 11        | R$ 4.019,90    |
| Set/2025   | 19        | R$ 6.284,39    |
| Out/2025   | 31        | R$ 12.786,66   |
| Nov/2025   | 38        | R$ 15.096,80   |
| Dez/2025   | 57        | R$ 21.837,77   |
| Jan/2026   | 1         | R$ 386,13      |
| **TOTAL**  | **157**   | **R$ 60.411,65** |

### 📑 Parcelas (Installments)
- **Total:** 808 parcelas criadas
- **Variação:** 4, 6, 8, 10, 12, 18 ou 24 parcelas por tratamento
- **Dias de vencimento:** 5, 10, 15, 20 ou 25 do mês

#### 📊 Status das Parcelas:
| Status     | Quantidade | Valor Total      |
|-----------|-----------|------------------|
| ✅ Pagas  | 157       | R$ 60.411,65     |
| ⚠️ Atrasadas | 40     | R$ 12.089,69     |
| 📅 Em Aberto | 611    | R$ 131.606,22    |
| **TOTAL**  | **808**   | **R$ 204.107,56** |

#### 🚨 Inadimplência:
- **Parcelas Atrasadas:** 40 (4.95%)
  - Atrasadas simples: 34
  - **Em Calote:** 6
- **Perfil de inadimplência:** 25% dos pacientes têm histórico de atrasos

## 🎯 Cenários Criados

### Pacientes Adimplentes (75%)
- ✅ 85% pagam em dia
- ⏱️ 15% atrasam ocasionalmente (1-3 dias)

### Pacientes com Problemas (25%)
- ⚠️ 50% pagam com atraso (1-10 dias)
- 🔴 30% ficam inadimplentes
- 🚫 20% entram em calote

## 🔄 Como Acessar os Dados

### Via Frontend (com autenticação):
```
http://localhost:4003/dashboard
http://localhost:4003/api/dashboard/stats
```

### Via Banco de Dados:
```bash
# Acessar o PostgreSQL
docker compose exec postgres psql -U adm -d db_easy

# Exemplos de queries
SELECT COUNT(*) FROM easy.patients;
SELECT COUNT(*) FROM easy.treatments;
SELECT COUNT(*) FROM easy.payments;
SELECT COUNT(*) FROM easy.installments;
```

## 📈 Gráficos Disponíveis

Com esses dados, os seguintes gráficos devem carregar corretamente:

1. ✅ **Evolução de Receita** (últimos 5 meses)
2. ✅ **Atendimentos Mensais** (66 tratamentos distribuídos)
3. ✅ **Tratamentos Recentes** (com índice de risco)
4. ✅ **Índice de Risco** (calculado com base em atrasos e calotes)
5. ✅ **Parcelas em Aberto/Atrasadas**
6. ✅ **Formas de Pagamento**

## 🔧 Troubleshooting

Se os gráficos não carregarem:

1. **Limpar cache do navegador:** Ctrl+Shift+R
2. **Reiniciar o backend:**
   ```bash
   docker compose restart easycore
   ```
3. **Verificar logs:**
   ```bash
   docker compose logs -f easycore
   ```
4. **Testar API diretamente:** Usar Postman/Insomnia com token de autenticação

## 📝 Próximos Passos

- [ ] Fazer login no sistema
- [ ] Acessar o dashboard
- [ ] Verificar se todos os gráficos carregam
- [ ] Testar filtros de data
- [ ] Verificar relatórios financeiros
