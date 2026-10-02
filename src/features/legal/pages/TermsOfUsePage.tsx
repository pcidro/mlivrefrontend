import { Link } from 'react-router-dom'
import { LegalPage } from '../components/LegalPage'

export function TermsOfUsePage() {
  return <LegalPage title="Termos de uso">
    <section><h2>1. Finalidade do sistema</h2>
      <p>A Central de Clientes é uma ferramenta interna da LJ Fontes para organizar informações de clientes relacionadas às vendas da empresa em marketplaces. O acesso às funcionalidades é restrito a usuários autorizados.</p>
    </section>
    <section><h2>2. Integrações e permissões</h2>
      <p>As integrações habilitadas consultam pedidos, entregas e documentos fiscais conforme as permissões concedidas pela conta responsável. O sistema não altera pedidos, não emite notas fiscais e não modifica dados nos marketplaces. A conexão com uma plataforma depende de autorização e da disponibilidade de sua API.</p>
    </section>
    <section><h2>3. Uso responsável</h2>
      <p>Os usuários devem manter suas credenciais protegidas e utilizar os dados somente para as atividades autorizadas da empresa, respeitando a privacidade dos clientes e as regras das plataformas. É proibido compartilhar acessos ou utilizar a ferramenta para obter dados de contas sem autorização.</p>
    </section>
    <section><h2>4. Contato pelo WhatsApp</h2>
      <p>Quando houver telefone disponível, o sistema permite abrir uma conversa no WhatsApp mediante ação manual do usuário. Não há envio automático nem disparo em massa. A disponibilidade de um telefone não representa autorização automática para publicidade ou campanhas.</p>
    </section>
    <section><h2>5. Disponibilidade e dados</h2>
      <p>As informações dependem dos dados fornecidos pelas plataformas. Nome, telefone ou documento podem estar ausentes. Falhas de integração e indisponibilidade podem interromper consultas; informações importadas não substituem a conferência dos registros oficiais de cada venda.</p>
    </section>
    <section><h2>6. Privacidade e atendimento</h2>
      <p>O tratamento dos dados está descrito na <Link to="/politica-de-privacidade">Política de privacidade</Link>. Para esclarecimentos sobre o sistema ou seus dados, utilize os canais de atendimento da LJ Fontes disponíveis na loja em que a compra foi realizada; usuários internos podem procurar a administração da empresa.</p>
    </section>
  </LegalPage>
}
