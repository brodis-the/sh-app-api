module.exports = function resetPassword( receiver, token){
  const html= `<!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de senha</title>
    <style>
      body{
        background-color: rgba(105, 105, 105, 0.2) ;
      }
      .content {
        background-color: #fff;
        padding: 3%;
        margin: 30px 70px;
        border-radius: 6px; 
        align-items: center;
      }
      .content-link {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .content .content-link a.button{
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        border-radius: 3px;
        background: rgba(223, 133, 42, 1);
        color: #fff;
        padding: 8px 12px;
        text-decoration: none;
        font-family: sans-serif, Arial;
        font-size: 18px;
      }
      .content .small-text {
        color: #595959;
        font-size: small;
        padding: 15px 0px;
        word-break:break-word;
      }
      .content .small-text p{
        margin: 0px;
      }
    </style>
  </head>
  <body>
    <div class="content">
      <h2>Olá ${receiver.name}, como você está? &#128515;</h2>
      <p>Recebemos sua solicitação de recuperação de senha. Estamos te enviando o endereço de link para que você possa cadastrar um nova senha. Mas vai pensando num jeitinho de guardar bem ela viu? Para continuar com a recuperação basta clicar no botão abaixo:</p>
  
      <div class="content-link">
        <a class="button" href="${process.env.FRONT_URL}/password/reset/?hash=${token}" target="_blank">Recuperar senha</a>
      </div>
      <div class="small-text">
        <p>
          Caso não funcione pra você acesse pelo seu navegador com este link 
        </p>
        <a href="${process.env.FRONT_URL}/password/reset/?hash=${token}" target="_blank">${process.env.FRONT_URL}/password/reset/?hash=${token}</a>
        
        <br><br>
        <p>
          Não foi você? Cancele a solicitação clicando 
          <a href="${process.env.FRONT_URL}/password/reset/abort/?hash=${token}" target="_blank">aqui</a>
        </p>
      </div>
      
      <br><hr>
      <span>Deus abençoe. Shalom! &#x1F54A;</span> 
    </div>
    <div class="content-link" >
      <p>Powered by <a href="https://github.com/brodis-the" target="_blank">Brodis-the</a></p>
    </div>
  </body>
  </html>`

  return {
    from: {name: process.env.APP_NAME, address: process.env.MAIL_FROM},
    to: receiver,
    subject: 'Recuperação de Senha',
    html
  }
}
