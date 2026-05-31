# Publicar o LaneDesk

## 1. Criar o banco no MongoDB Atlas

1. Crie um cluster no MongoDB Atlas.
2. Em Database Access, crie um usuario e senha.
3. Em Network Access, libere o IP `0.0.0.0/0` para o primeiro deploy.
4. Copie a connection string `mongodb+srv://...`.
5. Troque `<password>` pela senha real e mantenha o nome do banco no final, por exemplo:

```text
mongodb+srv://usuario:senha@cluster.mongodb.net/sistema-login
```

## 2. Subir o codigo para o GitHub

Crie um repositorio privado chamado `lanedesk` e envie os arquivos do projeto.

Nao envie:

- `.env`
- `node_modules/`
- `uploads/`
- `logs/`
- `server.out.log`
- `server.err.log`

Esses itens ja estao protegidos pelo `.gitignore`.

## 3. Criar o Web Service no Render

1. No Render, escolha New > Web Service.
2. Conecte o repositorio `lanedesk`.
3. Configure:

```text
Runtime: Node
Build Command: npm install
Start Command: npm start
```

4. Adicione as variaveis de ambiente:

```text
NODE_ENV=production
MONGO_URI=mongodb+srv://...
CLIENT_ORIGINS=https://SEU-SITE.onrender.com
COOKIE_SECURE=true
JWT_SECRET=gere_um_segredo_grande
SIEM_LOG_SECRET=gere_outro_segredo_grande
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://SEU-SITE.onrender.com/auth/google/callback
```

## 4. Google Login

Se for usar login com Google:

1. Abra o Google Cloud Console.
2. No OAuth Client, adicione o callback:

```text
https://SEU-SITE.onrender.com/auth/google/callback
```

3. Atualize `GOOGLE_CALLBACK_URL` no Render com esse mesmo valor.

## Observacao sobre anexos

No Render, arquivos enviados para `uploads/` podem sumir em redeploys, porque o disco do servico web nao e armazenamento permanente. Para producao de verdade, o ideal e mover anexos para S3, Cloudinary, Supabase Storage ou outro storage persistente.
