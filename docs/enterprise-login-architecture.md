# Arquitetura Enterprise de Login

Stack atual do projeto:

- Front-end: HTML, CSS e JavaScript puro.
- Back-end: Node.js com Express.
- Banco: MongoDB com Mongoose.
- SSO escolhido: Microsoft Entra ID via OAuth2/OIDC.

## Fluxo OIDC

1. O front-end inicia o login no Microsoft Entra ID.
2. O IdP autentica o colaborador e aplica MFA/Conditional Access corporativo.
3. O front-end envia o `idToken` para `POST /auth/oidc/microsoft`.
4. O backend baixa as chaves JWKS da Microsoft, valida assinatura, issuer, audience e expiração.
5. O backend extrai claims de identidade e grupos/funções.
6. O backend cria ou atualiza o usuário local sem senha.
7. O backend emite:
   - JWT curto em cookie `HttpOnly`, `Secure`, `SameSite=Strict`.
   - refresh token opaco em cookie separado, armazenado apenas no servidor.

## RBAC

Claims aceitas do IdP:

- `roles`
- `groups`

Mapeamento interno:

- `helpdesk-n1`, `analista-n1`, `n1` -> `n1`
- `helpdesk-n2`, `analista-n2`, `n2` -> `n2`
- `helpdesk-gestor`, `gestor`, `diretor` -> `gestor`
- Sem grupo reconhecido -> `funcionario`

## Zero Trust

Middleware: `backend/middlewares/zeroTrustPolicy.js`

Valida antes das rotas críticas:

- IP de origem dentro de `TRUSTED_CIDRS`.
- Requisição dentro de `ACCESS_WINDOWS`.

Exemplo:

```env
TRUSTED_CIDRS=10.10.0.0/16,172.20.0.0/16,192.168.10.0/24
ACCESS_WINDOWS=mon-fri:07:00-20:00;sat:08:00-14:00
```

Em produção, configure o proxy reverso para enviar `X-Forwarded-For` corretamente e mantenha `app.set('trust proxy', 1)`.

## Auditoria LGPD/SIEM

Banco:

- Collection `auditlogs`
- Guarda e-mail completo para investigação autorizada e acesso restrito a gestor.

Arquivo SIEM:

- `logs/security-events.log`
- Formato JSON por linha.
- E-mail mascarado.
- ID mascarado por HMAC.
- Senhas e tokens nunca são registrados.

Campos:

- `timestamp`
- `event`
- `status`
- `provider`
- `maskedUserId`
- `maskedEmail`
- `ip`
- `userAgent`
- `reason`
- `trackingHash`

## Sessão

Cookies:

- `HttpOnly`
- `Secure`
- `SameSite=Strict`
- `Path=/`

Expiração:

- Access token curto: `ACCESS_TOKEN_TTL=15m`
- Refresh token opaco: `REFRESH_TOKEN_TTL_MS=1800000`

Para produção, troque `backend/services/refreshTokenStore.js` por Redis. A interface necessária é:

- `createRefreshToken(userId)`
- `consumeRefreshToken(token)`
- `revokeRefreshToken(token)`

## Variáveis Obrigatórias

```env
JWT_SECRET=valor_longo_aleatorio
SIEM_LOG_SECRET=valor_longo_aleatorio_diferente
MICROSOFT_TENANT_ID=tenant_id_da_empresa
MICROSOFT_CLIENT_ID=application_client_id
COOKIE_SECURE=true
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_MS=1800000
TRUSTED_CIDRS=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
ACCESS_WINDOWS=mon-fri:07:00-20:00
SIEM_LOG_TO_STDOUT=false
```
