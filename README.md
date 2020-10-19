> ATENÇÃO: Este não é um aplicativo oficial do portal GNRE, e sim uma adaptação para pacote npm, tendo em vista que o mercado não
> possui soluções gratuítas para este fim. Qualquer ajuda é bem vinda!

# gnre-auto


## Resumo

O pacote ```gnre-auto``` possui 2 funções, seguindo os princípios do serviço oficial do portal GNRE:

```GnreLoteRecepcao```

e

```GnreResultadoLote```



## Instalação

```npm i gnre-auto```


## Utilização

***Node.js***

```javascript
  const gnre = require('gnre-auto')  
  
  gnre.GnreLoteRecepcao(dados, emitente, certificado)
  gnre.GnreResultadoLote(lote, certificado)
```

ou

```javascript
  { GnreLoteRecepcao, GnreResultadoLote } = require('gnre-auto')
  
  GnreLoteRecepcao(dados, emitente, certificado)
  GnreResultadoLote(lote, certificado)
```

### Tipos das variáveis

Valores marcados com ** devem ser consultados no portal para o preenchimento devido

```javascript
  // Array de objetos
  let dados = [
    {
      ufFavorecida: "", // Silga do estado do favorecido
      tipoGnre: "0", // Tipo da GNRE (0 - Gnre Simples é o único suportado até o momento)
      receita: "", // Codigo da receita **
      detalhamentoReceita: "", // Detalhamento da receita **
      documentoOrigem: { 
          tipo: "", // Tipo do documento de origem **
          valor: "" // Numero do documento de origem
      },
      produto: "", // Codigo do produto
      referencia: {
          periodo: "", // Periodo de referencia **
          mes: "", // Mes de refencia no formato MM
          ano: "", // Ano de referencia no formato AAAA
          parcela: "", // Quantidade de parcelas no formato X ou XX (caso valor maior que 9)
      },
      dataVencimento: "", // Data de vencimento da guia no formato AAAA-MM-DD
      valorPrincipal: { 
          tipo: "", // Tipo do valor ( Tipo 11 é o valor Principal) **
          valor: "" // Valor principal da guia usando separador decimal com "."
      },
      destinatario: {
          cnpj: "", // Preencher somente um dos campos, CNPJ ou CPF
          cpf: "",
          ie: "",
          razaoSocial: "", // Razao social do destinatário
          municipio: "", // Código IBGE do destinaatário
      },
      valorGnre: "", // Valor da guia usando separador decimal com "."
      dataPagamento: "", // Data de pagamento da guia no formato AAAA-MM-DD
      identificadorGuia: "" // Identificador da Guia **
    }
  ]
  
  // Objeto
  let emitente = {
    cnpj: "", // Preencher somente um dos campos, CNPJ ou CPF ou IE
    cpf: "", 
    ie: "",
    razaoSocial: "", // Razao Social do emitente
    endereco: "", // Endereço do Emitente
    municipio: "", // Municipio do Emitente
    uf: "" // Uf do Emitente
  }
  
  // String
  let lote = "" // Numero do lote recebido através da resposta da função GnreLoteRecepcao
  
  // Objeto
  let certificado = {
     path: "path/to/certfile.pfx", // Caminho do certificado no modelo .pfx
     pass: "" // Palavra-passe do certificado
  }
```

***GnreLoteRecepcao***

***GnreResultadoLote***

> WORK IN PROGRESS
