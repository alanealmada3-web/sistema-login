const tokenKey = 'sistema-login-token'
const sessionKey = 'sistema-login-session-started-at'

const authPanel = document.querySelector('#authPanel')
const dashboard = document.querySelector('#dashboard')
const loginTab = document.querySelector('#loginTab')
const registerTab = document.querySelector('#registerTab')
const recoverTab = document.querySelector('#recoverTab')
const authTitle = document.querySelector('#authTitle')
const authSubtitle = document.querySelector('#authSubtitle')
const accessButtons = document.querySelectorAll('[data-access]')
const loginForm = document.querySelector('#loginForm')
const registerForm = document.querySelector('#registerForm')
const recoverForm = document.querySelector('#recoverForm')
const requestResetButton = document.querySelector('#requestResetButton')
const message = document.querySelector('#message')
const logoutButton = document.querySelector('#logoutButton')
const portalEyebrow = document.querySelector('#portalEyebrow')
const dashboardTitle = document.querySelector('#dashboardTitle')
const dashboardSubtitle = document.querySelector('#dashboardSubtitle')
const ticketForm = document.querySelector('#ticketForm')
const ticketAttachmentsInput = document.querySelector('#ticketAttachments')
const ticketList = document.querySelector('#ticketList')
const queueTitle = document.querySelector('#queueTitle')
const statusFilter = document.querySelector('#statusFilter')
const categoryFilter = document.querySelector('#categoryFilter')
const priorityFilter = document.querySelector('#priorityFilter')
const slaFilter = document.querySelector('#slaFilter')
const refreshButton = document.querySelector('#refreshButton')
const emptyDetail = document.querySelector('#emptyDetail')
const ticketDetail = document.querySelector('#ticketDetail')
const actionsForm = document.querySelector('#actionsForm')
const commentForm = document.querySelector('#commentForm')
const attachmentForm = document.querySelector('#attachmentForm')
const attachmentInput = attachmentForm?.querySelector('input[name="anexos"]')
const attachmentList = document.querySelector('#attachmentList')
const chatStatus = document.querySelector('#chatStatus')
const chatMessages = document.querySelector('#chatMessages')
const chatForm = document.querySelector('#chatForm')
const assigneeSelect = document.querySelector('#assigneeSelect')
const closeResolvedButton = document.querySelector('#closeResolvedButton')
const corporateSsoButton = document.querySelector('#corporateSsoButton')
const localLoginToggle = document.querySelector('#localLoginToggle')
const localAuthArea = document.querySelector('#localAuthArea')
const themeToggle = document.querySelector('#themeToggle')
const themeToggleText = themeToggle.querySelector('.theme-toggle-text')
const languageToggle = document.querySelector('#languageToggle')
const languageToggleText = languageToggle.querySelector('.language-toggle-text')
const notificationButton = document.querySelector('#notificationButton')
const notificationPanel = document.querySelector('#notificationPanel')
const notificationCount = document.querySelector('#notificationCount')
const notificationList = document.querySelector('#notificationList')
const clearNotificationsButton = document.querySelector('#clearNotificationsButton')

const i18n = {
  pt: {
    locale: 'pt-BR',
    theme: { darkTarget: 'Claro', lightTarget: 'Escuro' },
    labels: {
      perfil: { funcionario: 'Funcionario', n1: 'Analista N1', n2: 'Analista N2', gestor: 'Gestor' },
      status: { aberto: 'Aberto', triagem: 'Triagem', andamento: 'Em andamento', resolvido: 'Resolvido', fechado: 'Fechado' },
      prioridade: { baixa: 'Baixa', media: 'Media', alta: 'Alta', critica: 'Critica' },
      categoria: { tecnico: 'Tecnico', infraestrutura: 'Infraestrutura', administrativo: 'Administrativo' },
      fila: { n1: 'N1', n2: 'N2' },
      sla: {
        'no-prazo': 'Dentro do SLA',
        'vence-breve': 'Vence em breve',
        vencido: 'SLA vencido',
        resolvido: 'Resolvido no SLA',
        'resolvido-atrasado': 'Resolvido fora do SLA',
      },
    },
    text: {
      visualSmall: 'ITSM seguro para operacoes corporativas',
      visualTitle: 'Atendimento de T.I. com governanca, SLA e auditoria em tempo real.',
      visualSubtitle: 'Centralize chamados, identidade, filas e evidencias em uma experiencia pronta para empresas.',
      eyebrow: 'Acesso corporativo seguro',
      employeeAccess: 'Funcionario',
      itAccess: 'Equipe de T.I.',
      authEmployeeTitle: 'Portal do Funcionario',
      authItTitle: 'Operacao de T.I.',
      authEmployeeSubtitle: 'Entre para abrir chamados, acompanhar SLAs e consultar a timeline das suas solicitacoes.',
      authItSubtitle: 'Entre para atender filas, priorizar chamados, cumprir SLAs e registrar auditoria operacional.',
      sso: 'Entrar com a Conta Corporativa',
      securityLgpd: 'Ambiente LGPD',
      securityAudit: 'Auditoria SIEM',
      localHide: 'Ocultar login local',
      localShow: 'Usar email e senha local',
      logout: 'Sair',
      loginTab: 'Entrar',
      registerTab: 'Cadastrar',
      recoverTab: 'Recuperar Senha',
      email: 'Email',
      password: 'Senha',
      name: 'Nome',
      profile: 'Perfil',
      confirmPassword: 'Confirmar senha',
      code: 'Codigo recebido',
      newPassword: 'Nova senha',
      confirmNewPassword: 'Confirmar nova senha',
      continue: 'Continuar',
      createAccount: 'Criar conta',
      requestCode: 'Solicitar codigo',
      resetPassword: 'Redefinir senha',
      showPassword: 'Ver',
      hidePassword: 'Ocultar',
      queueAuth: 'Fila autenticada',
      notifications: 'Notificacoes',
      noNotifications: 'Nenhuma notificacao no momento.',
      clear: 'Limpar',
      employeePortal: 'Portal do funcionario',
      employeePortalNote: 'Abra chamados para suporte interno e acompanhe o andamento das suas solicitacoes.',
      itPortal: 'Portal da T.I.',
      itPortalNote: 'Priorize, assuma, escale e resolva chamados conforme sua fila de atendimento.',
      metricOpen: 'Abertos',
      metricProgress: 'Em andamento',
      metricCritical: 'Criticos',
      metricSolved: 'Resolvidos',
      metricOverdue: 'Vencidos',
      newRequest: 'Nova solicitacao',
      openTicket: 'Abrir chamado',
      title: 'Titulo',
      description: 'Descricao',
      category: 'Categoria',
      impact: 'Impacto',
      urgency: 'Urgencia',
      attachments: 'Anexos',
      evidence: 'Anexar evidencias',
      tracking: 'Acompanhamento',
      ticketQueue: 'Fila de chamados',
      refresh: 'Atualizar',
      status: 'Status',
      allStatus: 'Todos os status',
      allCategories: 'Todas as categorias',
      allPriorities: 'Todas as prioridades',
      allSlas: 'Todos os SLAs',
      dueSoon: 'Vencem em breve',
      onTime: 'Dentro do prazo',
      solvedInSla: 'Resolvidos no SLA',
      solvedLate: 'Resolvidos fora do SLA',
      selectTicket: 'Selecione um chamado para ver a timeline.',
      keepStatus: 'Manter status',
      keepQueue: 'Manter fila',
      keepPriority: 'Manter prioridade',
      noAssignee: 'Sem responsavel',
      assignee: 'Responsavel',
      requester: 'Solicitante',
      deadline: 'Prazo',
      queue: 'Fila',
      createdAt: 'criado em',
      updated: 'Atualizado',
      notInformed: 'Nao informado',
      applyChanges: 'Aplicar alteracoes',
      closeResolved: 'Fechar chamado resolvido',
      comment: 'Comentario',
      addComment: 'Comentar',
      ticketChat: 'Chat do chamado',
      connected: 'Conectado',
      disconnected: 'Desconectado',
      chatUnavailable: 'Chat indisponivel',
      loading: 'Carregando...',
      connecting: 'Conectando...',
      noMessages: 'Nenhuma mensagem ainda.',
      noChatSelected: 'Selecione um chamado para iniciar a conversa.',
      message: 'Mensagem',
      sendMessage: 'Enviar mensagem',
      sendAttachments: 'Enviar anexos',
      noAttachments: 'Nenhum anexo enviado.',
      chooseFilesButton: 'Escolher arquivos',
      noFileChosen: 'Nenhum arquivo escolhido',
      oneFileChosen: '1 arquivo escolhido',
      filesChosen: 'arquivos escolhidos',
      timeline: 'Timeline',
      noTicketsQueue: 'Nenhum chamado nesta fila.',
      noTicketsEmployee: 'Voce ainda nao abriu chamados.',
      requestError: 'Erro na requisicao',
      googleNotConfigured: 'Login com Google nao configurado no servidor.',
      googleLoginFailed: 'Nao foi possivel concluir o login com Google. Use email e senha local ou revise o OAuth.',
      appLoadError: 'Erro ao carregar a interface. Recarregue a pagina.',
      activeSessionLoaded: 'Sessao ativa carregada.',
      expiredSession: 'Sessao expirada. Entre novamente.',
      signingIn: 'Entrando...',
      creatingAccount: 'Criando conta...',
      accountCreated: 'Conta criada. Voce ja pode entrar.',
      accountCreatedEmailPending: 'Conta criada. Voce ja pode entrar.',
      requestingRecovery: 'Solicitando recuperacao...',
      autoFilledCode: 'Codigo preenchido automaticamente.',
      resettingPassword: 'Redefinindo senha...',
      openingTicket: 'Abrindo chamado...',
      ticketOpenedTitle: 'Chamado aberto',
      ticketOpenedDescription: 'Seu chamado foi criado e registrado na timeline.',
      chooseFile: 'Selecione pelo menos um arquivo.',
      sendingAttachments: 'Enviando anexos...',
      attachmentsSentTitle: 'Anexos enviados',
      attachmentsSentDescription: 'Arquivos adicionados ao chamado.',
      chooseChange: 'Escolha pelo menos uma alteracao.',
      ticketUpdatedTitle: 'Chamado atualizado',
      ticketUpdatedDescription: 'Seu chamado foi atualizado.',
      commentAddedTitle: 'Comentario adicionado',
      commentAddedDescription: 'Seu comentario foi registrado no chamado.',
      chatDisconnectedTryAgain: 'Chat desconectado. Tente novamente em instantes.',
      typeMessage: 'Digite uma mensagem para enviar.',
      sendMessageError: 'Erro ao enviar mensagem.',
      signedOut: 'Voce saiu da conta.',
      ticketClosedTitle: 'Chamado fechado',
      ticketClosedDescription: 'Chamado fechado. Obrigado por confirmar a resolucao.',
      employeeAccountWrongAccess: 'Esta conta e de funcionario. Selecione Funcionario para entrar.',
      itAccountWrongAccess: 'Esta conta e da equipe de T.I. Selecione Equipe de T.I. para entrar.',
      nameMin: 'Informe um nome com pelo menos 2 caracteres.',
      invalidEmail: 'Informe um email valido.',
      passwordMin: 'A senha deve ter pelo menos 8 caracteres.',
      passwordLettersNumbers: 'A senha deve conter letras e numeros.',
      passwordsMismatch: 'As senhas nao conferem.',
      codeRequired: 'Informe o codigo recebido.',
      newPasswordMin: 'A nova senha deve ter pelo menos 8 caracteres.',
      newPasswordLettersNumbers: 'A nova senha deve conter letras e numeros.',
    },
  },
  en: {
    locale: 'en-US',
    theme: { darkTarget: 'Light', lightTarget: 'Dark' },
    labels: {
      perfil: { funcionario: 'Employee', n1: 'Tier 1 Analyst', n2: 'Tier 2 Analyst', gestor: 'Manager' },
      status: { aberto: 'Open', triagem: 'Triage', andamento: 'In progress', resolvido: 'Resolved', fechado: 'Closed' },
      prioridade: { baixa: 'Low', media: 'Medium', alta: 'High', critica: 'Critical' },
      categoria: { tecnico: 'Technical', infraestrutura: 'Infrastructure', administrativo: 'Administrative' },
      fila: { n1: 'T1', n2: 'T2' },
      sla: {
        'no-prazo': 'Within SLA',
        'vence-breve': 'Due soon',
        vencido: 'SLA overdue',
        resolvido: 'Resolved within SLA',
        'resolvido-atrasado': 'Resolved outside SLA',
      },
    },
    text: {
      visualSmall: 'Secure ITSM for enterprise operations',
      visualTitle: 'IT support with governance, SLA and real-time audit.',
      visualSubtitle: 'Centralize tickets, identity, queues and evidence in an enterprise-ready experience.',
      eyebrow: 'Secure corporate access',
      employeeAccess: 'Employee',
      itAccess: 'IT Team',
      authEmployeeTitle: 'Employee Portal',
      authItTitle: 'IT Operations',
      authEmployeeSubtitle: 'Sign in to open tickets, track SLAs and view your request timeline.',
      authItSubtitle: 'Sign in to manage queues, prioritize tickets, meet SLAs and record operational audit trails.',
      sso: 'Sign in with Corporate Account',
      securityLgpd: 'LGPD Environment',
      securityAudit: 'SIEM Audit',
      localHide: 'Hide local login',
      localShow: 'Use local email and password',
      logout: 'Sign out',
      loginTab: 'Sign in',
      registerTab: 'Register',
      recoverTab: 'Recover Password',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      profile: 'Profile',
      confirmPassword: 'Confirm password',
      code: 'Received code',
      newPassword: 'New password',
      confirmNewPassword: 'Confirm new password',
      continue: 'Continue',
      createAccount: 'Create account',
      requestCode: 'Request code',
      resetPassword: 'Reset password',
      showPassword: 'Show',
      hidePassword: 'Hide',
      queueAuth: 'Authenticated queue',
      notifications: 'Notifications',
      noNotifications: 'No notifications right now.',
      clear: 'Clear',
      employeePortal: 'Employee portal',
      employeePortalNote: 'Open internal support tickets and track the progress of your requests.',
      itPortal: 'IT portal',
      itPortalNote: 'Prioritize, assign, escalate and resolve tickets according to your support queue.',
      metricOpen: 'Open',
      metricProgress: 'In progress',
      metricCritical: 'Critical',
      metricSolved: 'Resolved',
      metricOverdue: 'Overdue',
      newRequest: 'New request',
      openTicket: 'Open ticket',
      title: 'Title',
      description: 'Description',
      category: 'Category',
      impact: 'Impact',
      urgency: 'Urgency',
      attachments: 'Attachments',
      evidence: 'Attach evidence',
      tracking: 'Tracking',
      ticketQueue: 'Ticket queue',
      refresh: 'Refresh',
      status: 'Status',
      allStatus: 'All statuses',
      allCategories: 'All categories',
      allPriorities: 'All priorities',
      allSlas: 'All SLAs',
      dueSoon: 'Due soon',
      onTime: 'On time',
      solvedInSla: 'Resolved within SLA',
      solvedLate: 'Resolved outside SLA',
      selectTicket: 'Select a ticket to view the timeline.',
      keepStatus: 'Keep status',
      keepQueue: 'Keep queue',
      keepPriority: 'Keep priority',
      noAssignee: 'No assignee',
      assignee: 'Assignee',
      requester: 'Requester',
      deadline: 'Deadline',
      queue: 'Queue',
      createdAt: 'created at',
      updated: 'Updated',
      notInformed: 'Not informed',
      applyChanges: 'Apply changes',
      closeResolved: 'Close resolved ticket',
      comment: 'Comment',
      addComment: 'Comment',
      ticketChat: 'Ticket chat',
      connected: 'Connected',
      disconnected: 'Disconnected',
      chatUnavailable: 'Chat unavailable',
      loading: 'Loading...',
      connecting: 'Connecting...',
      noMessages: 'No messages yet.',
      noChatSelected: 'Select a ticket to start the conversation.',
      message: 'Message',
      sendMessage: 'Send message',
      sendAttachments: 'Send attachments',
      noAttachments: 'No attachments sent.',
      chooseFilesButton: 'Choose files',
      noFileChosen: 'No file chosen',
      oneFileChosen: '1 file chosen',
      filesChosen: 'files chosen',
      timeline: 'Timeline',
      noTicketsQueue: 'No tickets in this queue.',
      noTicketsEmployee: 'You have not opened any tickets yet.',
      requestError: 'Request error',
      googleNotConfigured: 'Google login is not configured on the server.',
      googleLoginFailed: 'Could not complete Google login. Use local email and password or review OAuth settings.',
      appLoadError: 'Could not load the interface. Reload the page.',
      activeSessionLoaded: 'Active session loaded.',
      expiredSession: 'Session expired. Sign in again.',
      signingIn: 'Signing in...',
      creatingAccount: 'Creating account...',
      accountCreated: 'Account created. You can now sign in.',
      accountCreatedEmailPending: 'Account created. You can now sign in.',
      requestingRecovery: 'Requesting recovery...',
      autoFilledCode: 'Code filled automatically.',
      resettingPassword: 'Resetting password...',
      openingTicket: 'Opening ticket...',
      ticketOpenedTitle: 'Ticket opened',
      ticketOpenedDescription: 'Your ticket was created and added to the timeline.',
      chooseFile: 'Select at least one file.',
      sendingAttachments: 'Sending attachments...',
      attachmentsSentTitle: 'Attachments sent',
      attachmentsSentDescription: 'Files added to the ticket.',
      chooseChange: 'Choose at least one change.',
      ticketUpdatedTitle: 'Ticket updated',
      ticketUpdatedDescription: 'Your ticket was updated.',
      commentAddedTitle: 'Comment added',
      commentAddedDescription: 'Your comment was added to the ticket.',
      chatDisconnectedTryAgain: 'Chat disconnected. Try again shortly.',
      typeMessage: 'Type a message to send.',
      sendMessageError: 'Error sending message.',
      signedOut: 'You signed out.',
      ticketClosedTitle: 'Ticket closed',
      ticketClosedDescription: 'Ticket closed. Thank you for confirming the resolution.',
      employeeAccountWrongAccess: 'This is an employee account. Select Employee to sign in.',
      itAccountWrongAccess: 'This is an IT team account. Select IT Team to sign in.',
      nameMin: 'Enter a name with at least 2 characters.',
      invalidEmail: 'Enter a valid email.',
      passwordMin: 'Password must be at least 8 characters.',
      passwordLettersNumbers: 'Password must contain letters and numbers.',
      passwordsMismatch: 'Passwords do not match.',
      codeRequired: 'Enter the received code.',
      newPasswordMin: 'New password must be at least 8 characters.',
      newPasswordLettersNumbers: 'New password must contain letters and numbers.',
    },
  },
}

let currentLang = localStorage.getItem('helpdesk-lang') || 'pt'
let labels = i18n[currentLang].labels

let currentUser = null
let tickets = []
let selectedTicket = null
let supportUsers = []
let selectedAccess = 'funcionario'
let notifications = []
let chatSocket = null
let activeChatTicketId = null
let chatHistory = []
const notifiedOverdueTickets = new Set()

const savedTheme = localStorage.getItem('helpdesk-theme') || 'dark'
document.body.dataset.theme = savedTheme
document.body.dataset.lang = currentLang
document.documentElement.lang = currentLang === 'pt' ? 'pt-BR' : 'en'
themeToggleText.textContent = savedTheme === 'dark' ? i18n[currentLang].theme.darkTarget : i18n[currentLang].theme.lightTarget
languageToggleText.textContent = currentLang.toUpperCase()
let themeToggleTopBeforeClick = null

function tr(key) {
  return i18n[currentLang].text[key] || i18n.pt.text[key] || key
}

function setText(selector, value) {
  const element = document.querySelector(selector)
  if (element) element.textContent = value
}

function setAttribute(selector, name, value) {
  const element = document.querySelector(selector)
  if (element) element.setAttribute(name, value)
}

function setOptionText(select, value, text) {
  const option = select?.querySelector(`option[value="${value}"]`)
  if (option) option.textContent = text
}

function updateThemeToggleText() {
  themeToggleText.textContent = document.body.dataset.theme === 'dark'
    ? i18n[currentLang].theme.darkTarget
    : i18n[currentLang].theme.lightTarget
}

function updateLocalLoginToggleText() {
  localLoginToggle.textContent = localAuthArea.classList.contains('collapsed')
    ? tr('localShow')
    : tr('localHide')
}

function updateFilePicker(input) {
  const field = input?.closest('.file-field')
  const button = field?.querySelector('[data-file-button]')
  const status = field?.querySelector('[data-file-status]')
  const fileCount = input?.files?.length || 0

  if (button) button.textContent = tr('chooseFilesButton')
  if (!status) return

  if (!fileCount) {
    status.textContent = tr('noFileChosen')
  } else if (fileCount === 1) {
    status.textContent = input.files[0].name || tr('oneFileChosen')
  } else {
    status.textContent = `${fileCount} ${tr('filesChosen')}`
  }
}

function updateFilePickers() {
  ;[ticketAttachmentsInput, attachmentInput].forEach(updateFilePicker)
}

function labelFormFields() {
  const fieldLabels = [
    [loginForm.email, tr('email')],
    [loginForm.senha, tr('password')],
    [registerForm.nome, tr('name')],
    [registerForm.email, tr('email')],
    [registerForm.perfil, tr('profile')],
    [registerForm.senha, tr('password')],
    [registerForm.confirmarSenha, tr('confirmPassword')],
    [recoverForm.email, tr('email')],
    [recoverForm.token, tr('code')],
    [recoverForm.novaSenha, tr('newPassword')],
    [recoverForm.confirmarSenha, tr('confirmNewPassword')],
    [ticketForm.titulo, tr('title')],
    [ticketForm.descricao, tr('description')],
    [ticketForm.categoria, tr('category')],
    [ticketForm.impacto, tr('impact')],
    [ticketForm.urgencia, tr('urgency')],
    [ticketAttachmentsInput, tr('attachments')],
    [commentForm.comentario, tr('comment')],
    [chatForm.mensagem, tr('message')],
    [attachmentInput, tr('evidence')],
  ]

  fieldLabels.forEach(([field, text]) => {
    const label = field?.closest('label')
    const textNode = Array.from(label?.childNodes || []).find((node) => node.nodeType === Node.TEXT_NODE)
    if (textNode) textNode.textContent = `\n                ${text}\n              `
    if (field) field.setAttribute('aria-label', text)
  })
}

function applyStaticTranslations() {
  const text = i18n[currentLang].text
  labels = i18n[currentLang].labels
  document.body.dataset.lang = currentLang
  document.documentElement.lang = currentLang === 'pt' ? 'pt-BR' : 'en'
  languageToggleText.textContent = currentLang.toUpperCase()
  updateThemeToggleText()

  setText('.large-logo small', text.visualSmall)
  setText('.visual-copy h2', text.visualTitle)
  setText('.visual-copy p', text.visualSubtitle)
  setText('.brand-block .eyebrow', text.eyebrow)
  setText('#employeeAccessButton', text.employeeAccess)
  setText('#itAccessButton', text.itAccess)
  setText('#corporateSsoButton .button-label', text.sso)
  const lgpdBadge = document.querySelector('.security-strip span:nth-child(1)')
  if (lgpdBadge) lgpdBadge.innerHTML = `<i class="icon-shield" aria-hidden="true"></i>${text.securityLgpd}`
  const auditBadge = document.querySelector('.security-strip span:nth-child(5)')
  if (auditBadge) auditBadge.innerHTML = `<i class="icon-audit" aria-hidden="true"></i>${text.securityAudit}`
  setAttribute('#authPanel', 'aria-label', currentLang === 'pt' ? 'Acesso seguro ao LaneDesk' : 'Secure access to LaneDesk')
  setAttribute('#dashboard', 'aria-label', currentLang === 'pt' ? 'Dashboard do LaneDesk' : 'LaneDesk dashboard')
  setAttribute('.access-switch', 'aria-label', currentLang === 'pt' ? 'Tipo de acesso' : 'Access type')
  setAttribute('#corporateSsoButton', 'aria-label', text.sso)
  setAttribute('.security-strip', 'aria-label', currentLang === 'pt' ? 'Recursos de seguranca' : 'Security features')
  setAttribute('.tabs', 'aria-label', currentLang === 'pt' ? 'Escolha uma acao' : 'Choose an action')
  setAttribute('#notificationButton', 'aria-label', currentLang === 'pt' ? 'Abrir notificacoes' : 'Open notifications')
  setAttribute('#notificationPanel', 'aria-label', currentLang === 'pt' ? 'Notificacoes do sistema' : 'System notifications')
  setAttribute('.metrics', 'aria-label', currentLang === 'pt' ? 'Metricas dos chamados' : 'Ticket metrics')
  setAttribute('.filters', 'aria-label', currentLang === 'pt' ? 'Filtros' : 'Filters')
  setAttribute('.chat-panel', 'aria-label', currentLang === 'pt' ? 'Chat em tempo real do chamado' : 'Real-time ticket chat')
  setText('#loginTab', text.loginTab)
  setText('#registerTab', text.registerTab)
  setText('#recoverTab', text.recoverTab)
  setText('#loginForm button[type="submit"] .button-label', text.continue)
  setText('#registerForm .button-label', text.createAccount)
  setText('#requestResetButton', text.requestCode)
  setText('#recoverForm .button-label', text.resetPassword)
  setText('#logoutButton', text.logout)
  updateLocalLoginToggleText()
  setText('#portalEyebrow', text.queueAuth)
  setText('.notification-panel-header strong', text.notifications)
  setText('#clearNotificationsButton', text.clear)
  setText('.employee-only strong', text.employeePortal)
  setText('.employee-only span', text.employeePortalNote)
  setText('.it-only strong', text.itPortal)
  setText('.it-only span', text.itPortalNote)
  setText('#metricOpen + p', text.metricOpen)
  setText('#metricProgress + p', text.metricProgress)
  setText('#metricCritical + p', text.metricCritical)
  setText('#metricSolved + p', text.metricSolved)
  setText('#metricOverdue + p', text.metricOverdue)
  setText('.ticket-form .panel-kicker', text.newRequest)
  setText('.ticket-form h3', text.openTicket)
  setText('#ticketForm button[type="submit"]', text.openTicket)
  setText('.queue-panel .panel-kicker', text.tracking)
  setText('#refreshButton', text.refresh)
  setText('#emptyDetail', text.selectTicket)
  setText('#actionsForm button[type="submit"]', text.applyChanges)
  setText('#closeResolvedButton', text.closeResolved)
  setText('#commentForm button[type="submit"]', text.addComment)
  setText('.chat-header h3', text.ticketChat)
  setText('#chatStatus', text.disconnected)
  setText('#chatMessages .empty-notification', text.noChatSelected)
  setText('#chatForm button[type="submit"]', text.sendMessage)
  setText('#attachmentForm button[type="submit"]', text.sendAttachments)
  setText('.attachments-section h3', text.attachments)
  setText('.ticket-detail > div:last-child h3', text.timeline)
  setText('.detail-grid div:nth-child(1) span', text.status || 'Status')
  setText('.detail-grid div:nth-child(2) span', text.queue)
  setText('.detail-grid div:nth-child(3) span', text.requester)
  setText('.detail-grid div:nth-child(4) span', text.assignee)
  setText('.detail-grid div:nth-child(5) span', 'SLA')
  setText('.detail-grid div:nth-child(6) span', text.deadline)
  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    const input = button.parentElement.querySelector('input')
    button.textContent = input.type === 'text' ? text.hidePassword : text.showPassword
    button.setAttribute('aria-label', input.type === 'text' ? text.hidePassword : text.showPassword)
  })

  const translatedMessages = new Map([
    [i18n.pt.text.expiredSession, text.expiredSession],
    [i18n.en.text.expiredSession, text.expiredSession],
    [i18n.pt.text.activeSessionLoaded, text.activeSessionLoaded],
    [i18n.en.text.activeSessionLoaded, text.activeSessionLoaded],
    [i18n.pt.text.signedOut, text.signedOut],
    [i18n.en.text.signedOut, text.signedOut],
  ])
  if (translatedMessages.has(message.textContent)) {
    message.textContent = translatedMessages.get(message.textContent)
  }

  setOptionText(registerForm.perfil, 'funcionario', labels.perfil.funcionario)
  setOptionText(registerForm.perfil, 'n1', labels.perfil.n1)
  setOptionText(registerForm.perfil, 'n2', labels.perfil.n2)
  setOptionText(registerForm.perfil, 'gestor', labels.perfil.gestor)

  setOptionText(ticketForm.categoria, 'tecnico', labels.categoria.tecnico)
  setOptionText(ticketForm.categoria, 'infraestrutura', labels.categoria.infraestrutura)
  setOptionText(ticketForm.categoria, 'administrativo', labels.categoria.administrativo)
  setOptionText(ticketForm.impacto, 'baixo', labels.prioridade.baixa)
  setOptionText(ticketForm.impacto, 'medio', labels.prioridade.media)
  setOptionText(ticketForm.impacto, 'alto', labels.prioridade.alta)
  setOptionText(ticketForm.urgencia, 'baixa', labels.prioridade.baixa)
  setOptionText(ticketForm.urgencia, 'media', labels.prioridade.media)
  setOptionText(ticketForm.urgencia, 'alta', labels.prioridade.alta)

  statusFilter.options[0].textContent = text.allStatus
  categoryFilter.options[0].textContent = text.allCategories
  priorityFilter.options[0].textContent = text.allPriorities
  slaFilter.options[0].textContent = text.allSlas
  Array.from(statusFilter.options).slice(1).forEach((option) => { option.textContent = labels.status[option.value] })
  Array.from(categoryFilter.options).slice(1).forEach((option) => { option.textContent = labels.categoria[option.value] })
  Array.from(priorityFilter.options).slice(1).forEach((option) => { option.textContent = labels.prioridade[option.value] })
  Array.from(slaFilter.options).slice(1).forEach((option) => { option.textContent = labels.sla[option.value] })

  Array.from(actionsForm.status.options).forEach((option) => {
    option.textContent = option.value ? labels.status[option.value] : text.keepStatus
  })
  Array.from(actionsForm.fila.options).forEach((option) => {
    option.textContent = option.value ? labels.fila[option.value] : text.keepQueue
  })
  Array.from(actionsForm.prioridade.options).forEach((option) => {
    option.textContent = option.value ? labels.prioridade[option.value] : text.keepPriority
  })

  labelFormFields()
  updateFilePickers()
  updateAuthAccess(selectedAccess)
  if (currentUser) updateShell()
  renderNotifications()
  renderTickets()
  renderDetail()
}

function isItUser() {
  return ['n1', 'n2', 'gestor'].includes(currentUser?.perfil)
}

function isAccessCompatible(perfil) {
  if (selectedAccess === 'ti') return ['n1', 'n2', 'gestor'].includes(perfil)
  return perfil === 'funcionario'
}

function updateAuthAccess(access) {
  selectedAccess = access
  accessButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.access === access)
  })

  authTitle.textContent = access === 'ti' ? tr('authItTitle') : tr('authEmployeeTitle')
  authSubtitle.textContent = access === 'ti'
    ? tr('authItSubtitle')
    : tr('authEmployeeSubtitle')

  const profileSelect = registerForm.perfil
  Array.from(profileSelect.options).forEach((option) => {
    option.hidden = access === 'ti' ? option.value === 'funcionario' : option.value !== 'funcionario'
  })
  profileSelect.value = access === 'ti' ? 'n1' : 'funcionario'
}

function setMessage(text, type = '') {
  message.textContent = text
  message.className = `message ${type}`.trim()
}

function showAuthErrorFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const authError = params.get('authError')

  if (!authError) return

  const messageKey = authError === 'google_not_configured'
    ? 'googleNotConfigured'
    : 'googleLoginFailed'

  setMessage(tr(messageKey), 'error')
  window.history.replaceState({}, document.title, window.location.pathname)
}

function notify(title, description = tr('ticketUpdatedDescription')) {
  const notification = {
    id: crypto.randomUUID(),
    title,
    description,
    createdAt: new Date().toISOString(),
  }

  notifications.unshift(notification)
  notifications = notifications.slice(0, 12)
  renderNotifications()
  setMessage(description, 'success')
}

function addNotification(title, description) {
  notifications.unshift({
    id: crypto.randomUUID(),
    title,
    description,
    createdAt: new Date().toISOString(),
  })
  notifications = notifications.slice(0, 12)
  renderNotifications()
}

function renderNotifications() {
  notificationCount.textContent = String(notifications.length)
  notificationCount.dataset.count = String(notifications.length)

  if (!notifications.length) {
    notificationList.innerHTML = `<p class="empty-notification">${tr('noNotifications')}</p>`
    return
  }

  notificationList.innerHTML = notifications
    .map((item) => `
      <article class="notification-item">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.description)}</span>
        <span>${formatDate(item.createdAt)}</span>
      </article>
    `)
    .join('')
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function setButtonLoading(button, isLoading) {
  if (!button) return
  button.classList.toggle('is-loading', isLoading)
  button.setAttribute('aria-busy', String(isLoading))
  if ('disabled' in button) {
    button.disabled = isLoading
  }
}

function expandLocalAuth() {
  localAuthArea.classList.remove('collapsed')
  localLoginToggle.setAttribute('aria-expanded', 'true')
  localLoginToggle.textContent = tr('localHide')
}

function collapseLocalAuth() {
  localAuthArea.classList.add('collapsed')
  localLoginToggle.setAttribute('aria-expanded', 'false')
  localLoginToggle.textContent = tr('localShow')
}

function showTab(tab) {
  const isLogin = tab === 'login'
  const isRegister = tab === 'register'
  const isRecover = tab === 'recover'
  loginTab.classList.toggle('active', isLogin)
  registerTab.classList.toggle('active', isRegister)
  recoverTab.classList.toggle('active', isRecover)
  loginForm.classList.toggle('active', isLogin)
  registerForm.classList.toggle('active', isRegister)
  recoverForm.classList.toggle('active', isRecover)
  setMessage('')
}

function getFormData(form) {
  return Object.fromEntries(new FormData(form).entries())
}

function getToken() {
  return localStorage.getItem(tokenKey)
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const headers = isFormData
    ? { ...options.headers }
    : {
        'Content-Type': 'application/json',
        ...options.headers,
      }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: 'same-origin',
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.mensagem || tr('requestError'))
  }

  return data
}

function createTicketFormData(form) {
  const formData = new FormData()
  const values = getFormData(form)

  Object.entries(values).forEach(([key, value]) => {
    if (key !== 'anexos') formData.append(key, value)
  })

  Array.from(ticketAttachmentsInput?.files || []).forEach((file) => {
    formData.append('anexos', file)
  })

  return formData
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatSlaRemaining(sla) {
  if (!sla) return tr('notInformed')
  if (['resolvido', 'resolvido-atrasado'].includes(sla.status)) return labels.sla[sla.status]

  const hours = Number(sla.horasRestantes || 0)
  const absoluteHours = Math.abs(hours)
  const prefix = currentLang === 'pt'
    ? (hours < 0 ? 'Atrasado ha' : 'Restam')
    : (hours < 0 ? 'Overdue by' : 'Remaining')

  if (absoluteHours < 1) {
    return currentLang === 'pt' ? `${prefix} menos de 1h` : `${prefix} less than 1h`
  }

  if (absoluteHours < 24) {
    return `${prefix} ${absoluteHours.toFixed(1)}h`
  }

  return currentLang === 'pt'
    ? `${prefix} ${(absoluteHours / 24).toFixed(1)} dias`
    : `${prefix} ${(absoluteHours / 24).toFixed(1)} days`
}

function renderChatMessages() {
  if (!chatHistory.length) {
    chatMessages.innerHTML = `<p class="empty-notification">${tr('noMessages')}</p>`
    return
  }

  chatMessages.innerHTML = chatHistory
    .map((message) => {
      const isMine = String(message.autor) === String(currentUser?.id)
      return `
        <article class="chat-message ${isMine ? 'mine' : ''}">
          <strong>${escapeHtml(message.autorNome)} <span>${escapeHtml(labels.perfil[message.autorPerfil] || message.autorPerfil)}</span></strong>
          <p>${escapeHtml(message.mensagem)}</p>
          <time>${formatDate(message.createdAt)}</time>
        </article>
      `
    })
    .join('')
  chatMessages.scrollTop = chatMessages.scrollHeight
}

function setChatStatus(text, state = '') {
  chatStatus.textContent = text
  chatStatus.dataset.state = state
}

function initChatSocket() {
  if (chatSocket || typeof io === 'undefined') return

  chatSocket = io({
    withCredentials: true,
  })

  chatSocket.on('connect', () => {
    setChatStatus(tr('connected'), 'online')
    if (selectedTicket) joinTicketChat(selectedTicket._id)
  })

  chatSocket.on('disconnect', () => {
    setChatStatus(tr('disconnected'), 'offline')
  })

  chatSocket.on('connect_error', () => {
    setChatStatus(tr('chatUnavailable'), 'offline')
  })

  chatSocket.on('chat:message', (message) => {
    if (String(message.ticket) !== String(activeChatTicketId)) return
    chatHistory.push(message)
    chatHistory = chatHistory.slice(-120)
    renderChatMessages()
  })
}

function joinTicketChat(ticketId) {
  if (!chatSocket || !ticketId) return

  activeChatTicketId = ticketId
  chatHistory = []
  renderChatMessages()
  setChatStatus(chatSocket.connected ? tr('loading') : tr('connecting'), chatSocket.connected ? 'loading' : 'offline')

  chatSocket.emit('chat:join', { ticketId }, (response) => {
    if (!response?.ok) {
      setChatStatus(response?.mensagem || tr('chatUnavailable'), 'offline')
      chatHistory = []
      renderChatMessages()
      return
    }

    chatHistory = response.messages || []
    setChatStatus(tr('connected'), 'online')
    renderChatMessages()
  })
}

function formatDate(value) {
  if (!value) return tr('notInformed')
  return new Intl.DateTimeFormat(i18n[currentLang].locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function translateTimelineMessage(item) {
  const message = String(item?.mensagem || '')
  if (currentLang === 'pt') return message

  const author = item.autorNome || message.split(' ')[0] || ''
  const priorityValues = Object.entries({
    Baixa: labels.prioridade.baixa,
    Media: labels.prioridade.media,
    Alta: labels.prioridade.alta,
    Critica: labels.prioridade.critica,
  })
  const statusValues = Object.entries({
    Aberto: labels.status.aberto,
    Triagem: labels.status.triagem,
    'Em Andamento': labels.status.andamento,
    Resolvido: labels.status.resolvido,
    Fechado: labels.status.fechado,
  })

  if (item.tipo === 'criacao') return `${author} opened the ticket`

  const statusMatch = message.match(/alterou o status para (.+)$/)
  if (item.tipo === 'status' && statusMatch) {
    const translatedStatus = statusValues.find(([pt]) => pt === statusMatch[1])?.[1] || statusMatch[1]
    return `${author} changed the status to ${translatedStatus}`
  }

  const priorityMatch = message.match(/prioridade para (.+)$/)
  if (item.tipo === 'prioridade' && priorityMatch) {
    const translatedPriority = priorityValues.find(([pt]) => pt === priorityMatch[1])?.[1] || priorityMatch[1]
    return `${author} changed the priority to ${translatedPriority}`
  }

  const slaMatch = message.match(/SLA (definido|recalculado) automaticamente: ([0-9.]+)h para prioridade (.+)$/)
  if (item.tipo === 'sla' && slaMatch) {
    const translatedPriority = priorityValues.find(([pt]) => pt === slaMatch[3])?.[1] || slaMatch[3]
    return `SLA ${slaMatch[1] === 'definido' ? 'set' : 'recalculated'} automatically: ${slaMatch[2]}h for ${translatedPriority} priority`
  }

  const queueMatch = message.match(/moveu o chamado para a fila (.+)$/)
  if (item.tipo === 'fila' && queueMatch) return `${author} moved the ticket to queue ${queueMatch[1]}`

  const reassignMatch = message.match(/reatribuiu para (.+)$/)
  if (item.tipo === 'atribuicao' && reassignMatch) return `${author} reassigned it to ${reassignMatch[1]}`
  if (item.tipo === 'atribuicao' && message.includes('removeu o responsavel')) return `${author} removed the assignee`

  const commentMatch = message.match(/comentou: (.+)$/s)
  if (item.tipo === 'comentario' && commentMatch) return `${author} commented: ${commentMatch[1]}`

  const openAttachmentMatch = message.match(/anexou ([0-9]+) arquivo\(s\) ao abrir o chamado/)
  if (item.tipo === 'anexo' && openAttachmentMatch) return `${author} attached ${openAttachmentMatch[1]} file(s) while opening the ticket`

  const attachmentMatch = message.match(/anexou ([0-9]+) arquivo\(s\)/)
  if (item.tipo === 'anexo' && attachmentMatch) return `${author} attached ${attachmentMatch[1]} file(s)`

  return message
}

function validateRegisterForm(formData) {
  if (String(formData.nome || '').trim().length < 2) return tr('nameMin')
  if (!String(formData.email || '').includes('@')) return tr('invalidEmail')
  if (String(formData.senha || '').length < 8) return tr('passwordMin')
  if (!/[A-Za-z]/.test(formData.senha) || !/[0-9]/.test(formData.senha)) return tr('passwordLettersNumbers')
  if (formData.senha !== formData.confirmarSenha) return tr('passwordsMismatch')
  return ''
}

function validatePasswordResetForm(formData) {
  if (!String(formData.email || '').includes('@')) return tr('invalidEmail')
  if (!String(formData.token || '').trim()) return tr('codeRequired')
  if (String(formData.novaSenha || '').length < 8) return tr('newPasswordMin')
  if (!/[A-Za-z]/.test(formData.novaSenha) || !/[0-9]/.test(formData.novaSenha)) return tr('newPasswordLettersNumbers')
  if (formData.novaSenha !== formData.confirmarSenha) return tr('passwordsMismatch')
  return ''
}

function canOperate(ticket = selectedTicket) {
  if (!currentUser || !ticket) return false
  if (currentUser.perfil === 'gestor') return true
  if (currentUser.perfil === 'n1') return ticket.fila === 'n1' && ['baixa', 'media'].includes(ticket.prioridade)
  if (currentUser.perfil === 'n2') return ticket.fila === 'n2' || ['alta', 'critica'].includes(ticket.prioridade)
  return false
}

function canCloseOwnResolved(ticket = selectedTicket) {
  return (
    currentUser?.perfil === 'funcionario' &&
    ticket?.status === 'resolvido' &&
    ticket?.solicitante?._id === currentUser.id
  )
}

function updateShell() {
  authPanel.classList.add('hidden')
  dashboard.classList.remove('hidden')
  dashboard.classList.toggle('employee-mode', currentUser.perfil === 'funcionario')
  dashboard.classList.toggle('it-mode', isItUser())
  portalEyebrow.textContent = isItUser() ? tr('itPortal') : tr('employeePortal')
  dashboardTitle.textContent = currentLang === 'pt' ? `Ola, ${currentUser.nome}` : `Hello, ${currentUser.nome}`
  dashboardSubtitle.textContent = isItUser()
    ? `${labels.perfil[currentUser.perfil]} - ${currentLang === 'pt' ? 'fila operacional iniciada em' : 'operational queue started at'} ${formatDate(localStorage.getItem(sessionKey))}`
    : `${labels.perfil.funcionario} - ${currentLang === 'pt' ? 'acompanhe somente seus chamados. Sessao iniciada em' : 'track only your tickets. Session started at'} ${formatDate(localStorage.getItem(sessionKey))}`
  queueTitle.textContent = isItUser() ? (currentLang === 'pt' ? 'Fila da T.I.' : 'IT queue') : (currentLang === 'pt' ? 'Meus chamados' : 'My tickets')
}

function renderMetrics() {
  document.querySelector('#metricOpen').textContent = tickets.filter((item) => ['aberto', 'triagem'].includes(item.status)).length
  document.querySelector('#metricProgress').textContent = tickets.filter((item) => item.status === 'andamento').length
  document.querySelector('#metricCritical').textContent = tickets.filter((item) => item.prioridade === 'critica').length
  document.querySelector('#metricSolved').textContent = tickets.filter((item) => ['resolvido', 'fechado'].includes(item.status)).length
  document.querySelector('#metricOverdue').textContent = tickets.filter((item) => item.sla?.vencido).length
}

function alertOverdueTickets() {
  tickets
    .filter((ticket) => ticket.sla?.vencido)
    .forEach((ticket) => {
      if (notifiedOverdueTickets.has(ticket._id)) return
      notifiedOverdueTickets.add(ticket._id)
      addNotification(labels.sla.vencido, currentLang === 'pt' ? `${ticket.titulo} esta fora do prazo de atendimento.` : `${ticket.titulo} is outside the response deadline.`)
    })
}

function filteredTickets() {
  return tickets.filter((ticket) => {
    return (
      (!statusFilter.value || ticket.status === statusFilter.value) &&
      (!categoryFilter.value || ticket.categoria === categoryFilter.value) &&
      (!priorityFilter.value || ticket.prioridade === priorityFilter.value) &&
      (!slaFilter.value || ticket.sla?.status === slaFilter.value)
    )
  })
}

function renderTickets() {
  renderMetrics()
  const visibleTickets = filteredTickets()
  ticketList.innerHTML = ''

  if (!visibleTickets.length) {
    ticketList.innerHTML = `<div class="empty-state">${isItUser() ? tr('noTicketsQueue') : tr('noTicketsEmployee')}</div>`
    return
  }

  visibleTickets.forEach((ticket) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `ticket-card ${ticket.sla?.vencido ? 'sla-overdue' : ''} ${selectedTicket?._id === ticket._id ? 'active' : ''}`
    button.innerHTML = `
      <span class="ticket-topline">
        <strong>${ticket.titulo}</strong>
        <span class="priority-pill ${ticket.prioridade}">${labels.prioridade[ticket.prioridade]}</span>
      </span>
      <span>${labels.categoria[ticket.categoria]} - ${labels.status[ticket.status]}${isItUser() ? ` - ${tr('queue')} ${labels.fila[ticket.fila]}` : ''}</span>
      <span class="sla-pill ${ticket.sla?.status || 'no-prazo'}">${escapeHtml(labels.sla[ticket.sla?.status] || labels.sla['no-prazo'])} - ${escapeHtml(formatSlaRemaining(ticket.sla))}</span>
      <small>${isItUser() ? ticket.solicitante?.nome || tr('requester') : tr('updated')} - ${formatDate(ticket.updatedAt)}</small>
    `
    button.addEventListener('click', () => selectTicket(ticket._id))
    ticketList.appendChild(button)
  })
}

function setActionAvailability() {
  const disabled = !canOperate() && !canCloseOwnResolved()
  actionsForm.querySelectorAll('select, button').forEach((element) => {
    element.disabled = disabled
  })

  actionsForm.prioridade.disabled = currentUser?.perfil !== 'gestor'
  actionsForm.fila.disabled = !['n2', 'gestor'].includes(currentUser?.perfil)
  actionsForm.responsavel.disabled = !canOperate()

  if (canCloseOwnResolved()) {
    actionsForm.status.disabled = false
    actionsForm.querySelector('button').disabled = false
  }

  actionsForm.classList.toggle('hidden', !isItUser())
  closeResolvedButton.classList.toggle('hidden', !canCloseOwnResolved())
}

function renderAssignees() {
  assigneeSelect.innerHTML = `<option value="">${tr('noAssignee')}</option>`
  supportUsers.forEach((user) => {
    const option = document.createElement('option')
    option.value = user.id
    option.textContent = `${user.nome} (${labels.perfil[user.perfil]})`
    assigneeSelect.appendChild(option)
  })
}

function renderDetail() {
  if (!selectedTicket) {
    emptyDetail.classList.remove('hidden')
    ticketDetail.classList.add('hidden')
    activeChatTicketId = null
    chatHistory = []
    return
  }

  emptyDetail.classList.add('hidden')
  ticketDetail.classList.remove('hidden')

  document.querySelector('#detailMeta').textContent = `${labels.categoria[selectedTicket.categoria]} - ${tr('createdAt')} ${formatDate(selectedTicket.createdAt)}`
  document.querySelector('#detailTitle').textContent = selectedTicket.titulo
  document.querySelector('#detailDescription').textContent = selectedTicket.descricao
  document.querySelector('#detailPriority').textContent = labels.prioridade[selectedTicket.prioridade]
  document.querySelector('#detailPriority').className = `priority-pill ${selectedTicket.prioridade}`
  document.querySelector('#detailStatus').textContent = labels.status[selectedTicket.status]
  document.querySelector('#detailQueue').textContent = labels.fila[selectedTicket.fila]
  document.querySelector('#detailRequester').textContent = selectedTicket.solicitante?.nome || tr('notInformed')
  document.querySelector('#detailAssignee').textContent = selectedTicket.responsavel?.nome || tr('noAssignee')
  document.querySelector('#detailSlaStatus').innerHTML = `<span class="sla-pill ${selectedTicket.sla?.status || 'no-prazo'}">${escapeHtml(labels.sla[selectedTicket.sla?.status] || labels.sla['no-prazo'])}</span>`
  document.querySelector('#detailSlaDeadline').textContent = `${formatDate(selectedTicket.sla?.prazo || selectedTicket.prazoSla)} - ${formatSlaRemaining(selectedTicket.sla)}`
  renderAttachments()

  actionsForm.reset()
  actionsForm.status.value = ''
  actionsForm.fila.value = ''
  actionsForm.prioridade.value = ''
  assigneeSelect.value = selectedTicket.responsavel?._id || ''
  setActionAvailability()
  initChatSocket()
  joinTicketChat(selectedTicket._id)

  const timeline = document.querySelector('#timelineList')
  timeline.innerHTML = ''
  selectedTicket.timeline.forEach((item) => {
    const li = document.createElement('li')
    li.innerHTML = `<strong>${escapeHtml(translateTimelineMessage(item))}</strong><span>${formatDate(item.data)}</span>`
    timeline.appendChild(li)
  })
}

function renderAttachments() {
  const anexos = selectedTicket?.anexos || []

  if (!anexos.length) {
    attachmentList.innerHTML = `<p class="empty-notification">${tr('noAttachments')}</p>`
    return
  }

  attachmentList.innerHTML = anexos
    .map((anexo) => `
      <a class="attachment-item" href="${escapeHtml(anexo.caminho)}" target="_blank" rel="noopener">
        <strong>${escapeHtml(anexo.nomeOriginal)}</strong>
        <span>${escapeHtml(anexo.tipoMime)} - ${formatFileSize(anexo.tamanho)} - ${formatDate(anexo.criadoEm)}</span>
      </a>
    `)
    .join('')
}

function selectTicket(id) {
  selectedTicket = tickets.find((ticket) => ticket._id === id) || null
  renderTickets()
  renderDetail()
}

async function loadSupportUsers() {
  if (!['n1', 'n2', 'gestor'].includes(currentUser?.perfil)) {
    supportUsers = []
    renderAssignees()
    return
  }

  try {
    supportUsers = await request('/auth/usuarios-suporte')
  } catch {
    supportUsers = []
  }

  renderAssignees()
}

async function loadTickets(keepSelected = true) {
  if (!isItUser()) {
    statusFilter.value = ''
    categoryFilter.value = ''
    priorityFilter.value = ''
    slaFilter.value = ''
  }

  tickets = await request('/tickets')
  alertOverdueTickets()
  const selectedId = selectedTicket?._id
  selectedTicket = keepSelected ? tickets.find((ticket) => ticket._id === selectedId) || null : null
  renderTickets()
  renderDetail()
}

async function loadProfile() {
  try {
    currentUser = await request('/auth/perfil')
    if (!localStorage.getItem(sessionKey)) {
      localStorage.setItem(sessionKey, new Date().toISOString())
    }
    updateShell()
    initChatSocket()
    await loadSupportUsers()
    await loadTickets(false)
    setMessage(tr('activeSessionLoaded'), 'success')
  } catch (error) {
    if (chatSocket) {
      chatSocket.disconnect()
      chatSocket = null
    }
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(sessionKey)
    authPanel.classList.remove('hidden')
    dashboard.classList.add('hidden')
    setMessage(tr('expiredSession'), 'error')
  }
}

loginTab.addEventListener('click', () => showTab('login'))
registerTab.addEventListener('click', () => showTab('register'))
recoverTab.addEventListener('click', () => showTab('recover'))

function rememberThemeTogglePosition(event) {
  themeToggleTopBeforeClick = themeToggle.getBoundingClientRect().top
  event.preventDefault()
}

themeToggle.addEventListener('pointerdown', rememberThemeTogglePosition)
themeToggle.addEventListener('mousedown', rememberThemeTogglePosition)
themeToggle.addEventListener('touchstart', rememberThemeTogglePosition, { passive: false })

;[ticketAttachmentsInput, attachmentInput].forEach((input) => {
  input?.addEventListener('change', () => updateFilePicker(input))
})

themeToggle.addEventListener('click', () => {
  themeToggleTopBeforeClick = null
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark'
  document.body.dataset.theme = nextTheme
  localStorage.setItem('helpdesk-theme', nextTheme)
  updateThemeToggleText()
  themeToggle.blur()
})

languageToggle.addEventListener('click', () => {
  currentLang = currentLang === 'pt' ? 'en' : 'pt'
  localStorage.setItem('helpdesk-lang', currentLang)
  applyStaticTranslations()
  languageToggle.blur()
})

notificationButton.addEventListener('click', () => {
  const isHidden = notificationPanel.classList.toggle('hidden')
  notificationButton.setAttribute('aria-expanded', String(!isHidden))
})

clearNotificationsButton.addEventListener('click', () => {
  notifications = []
  renderNotifications()
})

localLoginToggle.addEventListener('click', () => {
  if (localAuthArea.classList.contains('collapsed')) {
    expandLocalAuth()
    loginForm.email?.focus()
  } else {
    collapseLocalAuth()
  }
})

corporateSsoButton.addEventListener('click', () => {
  corporateSsoButton.classList.add('is-loading')
  corporateSsoButton.setAttribute('aria-busy', 'true')
})

accessButtons.forEach((button) => {
  button.addEventListener('click', () => {
    updateAuthAccess(button.dataset.access)
    setMessage('')
  })
})

document.querySelectorAll('[data-password-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = button.parentElement.querySelector('input')
    const visible = input.type === 'text'
    input.type = visible ? 'password' : 'text'
    button.textContent = visible ? tr('showPassword') : tr('hidePassword')
    button.setAttribute('aria-label', visible ? tr('showPassword') : tr('hidePassword'))
  })
})

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  setMessage(tr('creatingAccount'))
  const submitButton = registerForm.querySelector('button[type="submit"]')
  setButtonLoading(submitButton, true)

  try {
    const formData = getFormData(registerForm)
    const validationError = validateRegisterForm(formData)

    if (validationError) {
      setMessage(validationError, 'error')
      return
    }

    delete formData.confirmarSenha
    const data = await request('/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify(formData),
    })

    registerForm.reset()
    showTab('login')
    setMessage(data.emailEnviado === false ? tr('accountCreatedEmailPending') : tr('accountCreated'), 'success')
  } catch (error) {
    setMessage(error.message, 'error')
  } finally {
    setButtonLoading(submitButton, false)
  }
})

requestResetButton.addEventListener('click', async () => {
  const email = String(recoverForm.email.value || '').trim()

  if (!email.includes('@')) {
    setMessage(tr('invalidEmail'), 'error')
    return
  }

  setMessage(tr('requestingRecovery'))
  setButtonLoading(requestResetButton, true)

  try {
    const data = await request('/auth/recuperar-senha', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })

    if (data.resetToken) {
      recoverForm.token.value = data.resetToken
    }

    setMessage(data.resetToken ? `${data.mensagem} ${tr('autoFilledCode')}` : data.mensagem, 'success')
  } catch (error) {
    setMessage(error.message, 'error')
  } finally {
    setButtonLoading(requestResetButton, false)
  }
})

recoverForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  setMessage(tr('resettingPassword'))
  const submitButton = recoverForm.querySelector('button[type="submit"]')
  setButtonLoading(submitButton, true)

  try {
    const formData = getFormData(recoverForm)
    const validationError = validatePasswordResetForm(formData)

    if (validationError) {
      setMessage(validationError, 'error')
      return
    }

    const data = await request('/auth/redefinir-senha', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.email,
        token: formData.token,
        novaSenha: formData.novaSenha,
      }),
    })

    recoverForm.reset()
    showTab('login')
    setMessage(data.mensagem, 'success')
  } catch (error) {
    setMessage(error.message, 'error')
  } finally {
    setButtonLoading(submitButton, false)
  }
})

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  setMessage(tr('signingIn'))
  const submitButton = loginForm.querySelector('button[type="submit"]')
  setButtonLoading(submitButton, true)

  try {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(getFormData(loginForm)),
    })

    localStorage.setItem(sessionKey, new Date().toISOString())
    loginForm.reset()
    currentUser = data.usuario
    updateAuthAccess(isItUser() ? 'ti' : 'funcionario')
    await loadProfile()
  } catch (error) {
    setMessage(error.message, 'error')
  } finally {
    setButtonLoading(submitButton, false)
  }
})

ticketForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  setMessage(tr('openingTicket'))

  try {
    const ticket = await request('/tickets', {
      method: 'POST',
      body: createTicketFormData(ticketForm),
    })
    ticketForm.reset()
    updateFilePicker(ticketAttachmentsInput)
    await loadTickets(false)
    selectTicket(ticket._id)
    notify(tr('ticketOpenedTitle'), tr('ticketOpenedDescription'))
  } catch (error) {
    setMessage(error.message, 'error')
  }
})

attachmentForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  if (!selectedTicket) return

  const formData = new FormData(attachmentForm)

  if (!attachmentInput.files.length) {
    setMessage(tr('chooseFile'), 'error')
    return
  }

  setMessage(tr('sendingAttachments'))

  try {
    selectedTicket = await request(`/tickets/${selectedTicket._id}/anexos`, {
      method: 'POST',
      body: formData,
    })
    attachmentForm.reset()
    updateFilePicker(attachmentInput)
    await loadTickets(true)
    notify(tr('attachmentsSentTitle'), tr('attachmentsSentDescription'))
  } catch (error) {
    setMessage(error.message, 'error')
  }
})

actionsForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  if (!selectedTicket) return

  const formData = getFormData(actionsForm)
  const payload = {}
  Object.entries(formData).forEach(([key, value]) => {
    if (value || key === 'responsavel') payload[key] = value
  })

  if (!Object.keys(payload).length) {
    setMessage(tr('chooseChange'), 'error')
    return
  }

  try {
    selectedTicket = await request(`/tickets/${selectedTicket._id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    await loadTickets(true)
    notify(tr('ticketUpdatedTitle'), tr('ticketUpdatedDescription'))
  } catch (error) {
    setMessage(error.message, 'error')
  }
})

commentForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  if (!selectedTicket) return

  try {
    selectedTicket = await request(`/tickets/${selectedTicket._id}/comentarios`, {
      method: 'POST',
      body: JSON.stringify(getFormData(commentForm)),
    })
    commentForm.reset()
    await loadTickets(true)
    notify(tr('commentAddedTitle'), tr('commentAddedDescription'))
  } catch (error) {
    setMessage(error.message, 'error')
  }
})

chatForm.addEventListener('submit', (event) => {
  event.preventDefault()

  if (!selectedTicket || !chatSocket?.connected) {
    setMessage(tr('chatDisconnectedTryAgain'), 'error')
    return
  }

  const mensagem = String(chatForm.mensagem.value || '').trim()

  if (!mensagem) {
    setMessage(tr('typeMessage'), 'error')
    return
  }

  chatSocket.emit('chat:message', {
    ticketId: selectedTicket._id,
    mensagem,
  }, (response) => {
    if (!response?.ok) {
      setMessage(response?.mensagem || tr('sendMessageError'), 'error')
      return
    }

    chatForm.reset()
  })
})

logoutButton.addEventListener('click', async () => {
  try {
    await request('/auth/logout', { method: 'POST' })
  } catch {
  }

  localStorage.removeItem(tokenKey)
  localStorage.removeItem(sessionKey)
  currentUser = null
  tickets = []
  selectedTicket = null
  activeChatTicketId = null
  chatHistory = []
  if (chatSocket) {
    chatSocket.disconnect()
    chatSocket = null
  }
  dashboard.classList.add('hidden')
  dashboard.classList.remove('employee-mode', 'it-mode')
  authPanel.classList.remove('hidden')
  setMessage(tr('signedOut'), 'success')
})

closeResolvedButton.addEventListener('click', async () => {
  if (!selectedTicket || !canCloseOwnResolved()) return

  try {
    selectedTicket = await request(`/tickets/${selectedTicket._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'fechado' }),
    })
    await loadTickets(true)
    notify(tr('ticketClosedTitle'), tr('ticketClosedDescription'))
  } catch (error) {
    setMessage(error.message, 'error')
  }
})

refreshButton.addEventListener('click', () => loadTickets(true))
statusFilter.addEventListener('change', renderTickets)
categoryFilter.addEventListener('change', renderTickets)
priorityFilter.addEventListener('change', renderTickets)
slaFilter.addEventListener('change', renderTickets)

try {
  applyStaticTranslations()
  loadProfile().finally(showAuthErrorFromUrl)
} catch (error) {
  setMessage(tr('appLoadError'), 'error')
  console.error(error)
}
