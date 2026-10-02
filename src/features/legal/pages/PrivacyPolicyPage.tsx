import { LegalPage } from '../components/LegalPage'

export function PrivacyPolicyPage() {
  return <LegalPage title="Política de privacidade">
    <section><h2>1. Responsável e finalidade</h2>
      <p>A LJ Fontes utiliza a Central de Clientes para organizar informações relacionadas às suas vendas e facilitar consultas internas e o atendimento aos clientes. Os dados de clientes não são disponibilizados publicamente por este sistema.</p>
    </section>
    <section><h2>2. Dados utilizados</h2>
      <p>Conforme a disponibilidade nas integrações autorizadas, são utilizados nome, telefone, CPF ou CNPJ do destinatário, identificação e data do pedido, produtos e dados necessários da nota fiscal. Também são armazenadas informações da conta de origem, como nome e CNPJ, e dos usuários autorizados, como nome, e-mail e senha protegida por hash.</p>
    </section>
    <section><h2>3. Origem e uso das informações</h2>
      <p>As informações vêm de pedidos, entregas e documentos fiscais das contas de marketplace autorizadas pela empresa. Quando um XML de NF-e é disponibilizado, ele é processado para extrair os campos necessários e não é armazenado permanentemente pelo sistema. A ausência de telefone é respeitada e não gera um contato fictício.</p>
    </section>
    <section><h2>4. Acesso e proteção</h2>
      <p>As funcionalidades exigem autenticação e o acesso aos registros segue os vínculos das contas autorizadas. As credenciais de marketplace permanecem no backend e seus tokens são armazenados de forma criptografada. Cookies de sessão são usados para manter o acesso autenticado; não são utilizados para publicidade.</p>
    </section>
    <section><h2>5. Hospedagem e serviços externos</h2>
      <p>A operação pode utilizar fornecedores de infraestrutura, incluindo Render para hospedagem e Neon para o banco de dados. Os marketplaces participam das consultas autorizadas. Ao abrir uma conversa, o usuário acessa o WhatsApp, sujeito às regras e à política de privacidade desse serviço. A ferramenta não oferece venda de dados, campanhas ou envio automático de mensagens.</p>
    </section>
    <section><h2>6. Retenção e solicitações</h2>
      <p>Os registros são mantidos conforme a necessidade operacional e as obrigações aplicáveis à empresa. Desconectar uma conta interrompe seu acesso à integração, mas preserva os registros já importados; não equivale à exclusão dos dados. Solicitações de acesso, correção ou exclusão devem ser encaminhadas à LJ Fontes pelos canais de atendimento da loja em que a compra foi realizada, para avaliação e atendimento conforme o caso.</p>
    </section>
    <section><h2>7. Atualizações e contato</h2>
      <p>Esta página poderá ser atualizada para refletir mudanças na operação. Para dúvidas sobre privacidade, entre em contato com a LJ Fontes pelos canais de atendimento de sua loja; usuários internos também podem procurar a administração da empresa.</p>
    </section>
  </LegalPage>
}
